import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/security/auth";

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { password } = await request.json();
    const serverSupportPassword = process.env.SUPPORT_PASSWORD || 'support99';

    if (password === serverSupportPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
