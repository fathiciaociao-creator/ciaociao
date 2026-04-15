import { NextResponse } from 'next/server';
import { BRANDING } from '@/constants/branding';

export async function GET() {
  const manifest = {
    name: `${BRANDING.shortNameEn} Admin`,
    short_name: `${BRANDING.shortNameEn} Admin`,
    description: `${BRANDING.nameEn} Admin Dashboard`,
    start_url: '/admin',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: BRANDING.colors.primary,
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  return NextResponse.json(manifest);
}
