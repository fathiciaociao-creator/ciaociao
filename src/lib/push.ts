import webpush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:admin@xianjo.com',
    publicKey,
    privateKey
  );
}

export async function sendOrderNotification(subscription: any, orderId: string, total: number) {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    const payload = JSON.stringify({
      title: '📦 طلب جديد وصل! 🚨',
      body: `الطلب #${orderId.slice(-4)} بقيمة ${total.toFixed(2)} د.أ`,
      icon: '/logo.png',
      badge: '/logo.png',
      url: '/admin'
    });

    await webpush.sendNotification(pushSubscription, payload);
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
}
