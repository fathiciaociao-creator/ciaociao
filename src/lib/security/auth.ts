import { cookies } from 'next/headers';

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin_auth')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminAuth || !adminPassword) return false;

  const expectedToken = Buffer.from(`${adminPassword}:${process.env.AUTH_SECRET || 'fallback-secret'}`).toString('base64');
  
  return adminAuth === expectedToken;
}
