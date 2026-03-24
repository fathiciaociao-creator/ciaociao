import { NextResponse } from 'next/server';
import { isAllowedRequest, extractIP } from '@/lib/security/rateLimiter';

export async function POST(request: Request) {
  const clientIp = extractIP(request);
  
  // Rate Limit: 5 attempts per 15 minutes
  if (!isAllowedRequest(clientIp, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ 
      success: false, 
      error: "كثير من المحاولات الفاشلة. يرجى الانتظار 15 دقيقة قبل المحاولة مرة أخرى." 
    }, { status: 429 });
  }

  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ success: false, error: "النظام غير مهيأ بعد (كلمة المرور مفقودة)" }, { status: 500 });
    }

    if (password === adminPassword) {
      // Set an HTTP-Only secure cookie to bind the session
      const response = NextResponse.json({ success: true, message: "تم تسجيل الدخول بنجاح" });
      
      response.cookies.set({
        name: 'admin_auth',
        value: password, // Forcing the middleware to check this exact string guarantees unforgeability without complex JWTs.
        maxAge: 60 * 60 * 24 * 7, // 7 days expiration
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return response;
    }

    return NextResponse.json({ success: false, error: "كلمة المرور غير صحيحة" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
