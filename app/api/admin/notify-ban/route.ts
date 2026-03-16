import { NextResponse } from 'next/server';
import { sendBanEmail, sendUnbanEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, duration, reason, type = 'ban' } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    let result;
    if (type === 'unban') {
      result = await sendUnbanEmail(email, name);
    } else {
      if (!duration) return NextResponse.json({ error: 'Falta duración' }, { status: 400 });
      result = await sendBanEmail(email, name, duration, reason || "Incumplimiento de normas");
    }
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error || 'Error al enviar email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
