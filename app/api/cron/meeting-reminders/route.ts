import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { sendMeetingInvitation } from '@/lib/email';
import { Timestamp } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const manualMeetingId = request.headers.get('x-meeting-id') || searchParams.get('meetingId');
  
  console.log(`[Cron] Iniciando proceso de recordatorios. Manual ID: ${manualMeetingId || 'None'}`);

  // Security check for production cron
  const authHeader = request.headers.get('authorization');
  const isCronSecretValid = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && !isCronSecretValid && !manualMeetingId) {
    console.warn('[Cron] Intento de acceso no autorizado');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const adminDb = getAdminDb();
    let meetingsToProcess: any[] = [];
    const now = new Date();

    if (manualMeetingId) {
      console.log(`[Cron] Buscando reunión específica: ${manualMeetingId}`);
      const meetingSnap = await adminDb.collection('meetings').doc(manualMeetingId).get();
      
      if (!meetingSnap.exists) {
        console.error(`[Cron] Reunión ${manualMeetingId} no encontrada`);
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }

      const meetingData = meetingSnap.data();
      if (meetingData?.reminderSent) {
        console.log(`[Cron] El recordatorio para la reunión ${manualMeetingId} ya fue enviado previamente.`);
        return NextResponse.json({ 
          success: true, 
          message: 'Recordatorio ya enviado previamente',
          alreadySent: true 
        });
      }
      
      meetingsToProcess = [{ id: meetingSnap.id, ...meetingData }];
    } else {
      console.log('[Cron] Buscando reuniones próximas automáticamente');
      const meetingsSnap = await adminDb.collection('meetings')
        .where('autoReminder', '==', true)
        .where('reminderSent', '==', false)
        .where('date', '>', Timestamp.fromDate(now))
        .get();
      
      meetingsToProcess = meetingsSnap.docs.filter(d => {
        const data = d.data();
        const meetingDate = data.date.toDate();
        const leadTimeMins = data.reminderLeadTime || 60;
        const leadTimeMs = leadTimeMins * 60 * 1000;
        
        return (meetingDate.getTime() - now.getTime()) <= leadTimeMs;
      }).map(d => ({ id: d.id, ...d.data() }));
    }

    console.log(`[Cron] Encontradas ${meetingsToProcess.length} reuniones para procesar`);

    if (meetingsToProcess.length === 0) {
      return NextResponse.json({ message: 'No meetings require reminders at this time' });
    }

    // Fetch all users
    console.log('[Cron] Obteniendo lista de usuarios');
    const usersSnap = await adminDb.collection('users').get();
    const users = usersSnap.docs.map(d => ({
      email: d.data().email,
      displayName: d.data().displayName
    })).filter(u => u.email);

    console.log(`[Cron] Enviando a ${users.length} usuarios`);

    let emailsTotal = 0;

    for (const meeting of meetingsToProcess) {
      const meetingInfo = {
        title: meeting.title,
        description: meeting.description,
        date: meeting.date.toDate(),
        duration: meeting.duration,
        location: meeting.location,
        meetLink: meeting.meetLink || ""
      };

      // Send to all users - Usamos for-of para no saturar si hay muchos usuarios, 
      // y captura de errores individual
      for (const user of users) {
        try {
          await sendMeetingInvitation(user.email, user.displayName, meetingInfo);
          emailsTotal++;
        } catch (emailError) {
          console.error(`[Cron] Error enviando email a ${user.email}:`, emailError);
        }
      }

      // Mark as sent using Admin SDK
      console.log(`[Cron] Marcando reunión ${meeting.id} como enviada`);
      await adminDb.collection('meetings').doc(meeting.id).update({
        reminderSent: true,
        reminderSentAt: Timestamp.now()
      });
    }

    console.log(`[Cron] Proceso finalizado con éxito. ${emailsTotal} correos enviados.`);
    return NextResponse.json({ 
      success: true, 
      meetingsProcessed: meetingsToProcess.length,
      emailsSent: emailsTotal
    });

  } catch (error: any) {
    console.error('[Cron] ERROR CRÍTICO:', error);
    if (error.message === 'Firebase Admin environment variables missing') {
      return NextResponse.json({ message: 'Administrative functions skipped (missing env vars)' });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
