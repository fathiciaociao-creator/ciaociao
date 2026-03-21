import { NextResponse } from 'next/server';
export const runtime = 'experimental-edge';

export default function proxy() {
  return NextResponse.next();
}
