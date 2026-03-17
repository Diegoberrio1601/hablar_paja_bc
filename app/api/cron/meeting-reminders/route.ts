import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { sendMeetingInvitation } from '@/lib/email';
import { Timestamp } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const manualMeetingId = request.headers.get('x-meeting-id') || searchParams.get('meetingId');
  
  // Security check for production cron
  const authHeader = request.headers.get('authorization');
  const isCronSecretValid = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && !isCronSecretValid && !manualMeetingId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const adminDb = getAdminDb();
    let meetingsToProcess: any[] = [];
    const now = new Date();

    if (manualMeetingId) {
      // Manual trigger for a specific meeting using Admin SDK
      const meetingSnap = await adminDb.collection('meetings').doc(manualMeetingId).get();
      
      if (!meetingSnap.exists) {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }
      
      meetingsToProcess = [{ id: meetingSnap.id, ...meetingSnap.data() }];
    } else {
      // Automatic cron check using Admin SDK
      const meetingsSnap = await adminDb.collection('meetings')
        .where('autoReminder', '==', true)
        .where('reminderSent', '==', false)
        .where('date', '>', Timestamp.fromDate(now))
        .get();
      
      // Filter by lead time in memory
      meetingsToProcess = meetingsSnap.docs.filter(d => {
        const data = d.data();
        const meetingDate = data.date.toDate();
        const leadTimeMins = data.reminderLeadTime || 60;
        const leadTimeMs = leadTimeMins * 60 * 1000;
        
        return (meetingDate.getTime() - now.getTime()) <= leadTimeMs;
      }).map(d => ({ id: d.id, ...d.data() }));
    }

    if (meetingsToProcess.length === 0) {
      return NextResponse.json({ message: 'No meetings require reminders at this time' });
    }

    // Fetch all users using Admin SDK
    const usersSnap = await adminDb.collection('users').get();
    const users = usersSnap.docs.map(d => ({
      email: d.data().email,
      displayName: d.data().displayName
    })).filter(u => u.email);

    let emailsTotal = 0;

    for (const meeting of meetingsToProcess) {
      const meetingInfo = {
        title: meeting.title,
        description: meeting.description,
        date: meeting.date.toDate(),
        duration: meeting.duration,
        location: meeting.location
      };

      // Send to all users
      const emailPromises = users.map(user => 
        sendMeetingInvitation(user.email, user.displayName, meetingInfo)
      );

      await Promise.all(emailPromises);
      emailsTotal += users.length;

      // Mark as sent using Admin SDK
      await adminDb.collection('meetings').doc(meeting.id).update({
        reminderSent: true,
        reminderSentAt: Timestamp.now()
      });
    }

    return NextResponse.json({ 
      success: true, 
      meetingsProcessed: meetingsToProcess.length,
      emailsSent: emailsTotal
    });

  } catch (error: any) {
    console.error('Cron Meeting Reminder Error:', error);
    // If it's a build-time missing env var error, we return a 200 but with a message 
    // to avoid breaking build collection if Next.js attempts it.
    if (error.message === 'Firebase Admin environment variables missing') {
      return NextResponse.json({ message: 'Administrative functions skipped (missing env vars)' });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
