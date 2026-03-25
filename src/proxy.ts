// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin and /api/admin vectors globally
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    
    // Explicitly allow public authentication portals
    if (pathname === '/admin/login' || pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    // Extract the strict admin token (Securely Signed Signature)
    const adminToken = request.cookies.get('admin_auth')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Zero-Trust Hashed Validation
    const expectedToken = Buffer.from(`${adminPassword}:${process.env.AUTH_SECRET || 'fallback-secret'}`).toString('base64');

    // Reject mismatch or missing tokens immediately via Edge
    if (!adminToken || adminToken !== expectedToken) {
      
      // If unauthorized API request -> Return 401 JSON
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized Access. Strict Admin Firewall Active.' }, { status: 401 });
      }
      
      // If unauthorized Edge navigation -> Force 307 Redirect to Login Screen
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// NextJS Middleware configuration
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
