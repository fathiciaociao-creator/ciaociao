import { NextResponse } from 'next/server';
import { prisma } from '@/db';

export async function POST(req: Request) {
  try {
    const subscription = await req.json();
    
    // Save or update subscription in DB
    const saved = await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    return NextResponse.json({ success: true, id: saved.id });
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json({ success: false, error: 'Failed to subscribe' }, { status: 500 });
  }
}
