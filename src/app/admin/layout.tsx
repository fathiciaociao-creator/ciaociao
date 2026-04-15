import { Metadata } from 'next';
import { BRANDING } from '@/constants/branding';

export const metadata: Metadata = {
  title: BRANDING.admin.titleAr,
  manifest: '/api/admin/manifest',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
