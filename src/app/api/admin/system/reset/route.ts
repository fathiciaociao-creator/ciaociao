import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/security/auth";

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  try {
    const { action } = await request.json();

    if (action === 'RESET_ALL_DATA') {
      // DANGER: Wipes all orders, items, and users (clients), sessions/accounts (but keeps products and settings)
      await prisma.$transaction([
        prisma.orderItem.deleteMany(),
        prisma.order.deleteMany(),
        prisma.user.deleteMany(),
        prisma.pushSubscription.deleteMany(),
      ]);
      return NextResponse.json({ success: true, message: "All order data and user records have been wiped successfully." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("System API Error:", error);
    return NextResponse.json({ error: "Failed to perform system action" }, { status: 500 });
  }
}
