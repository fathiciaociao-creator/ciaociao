import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/security/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const archivedOrders = await prisma.order.findMany({
      where: { isArchived: true },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(archivedOrders);
  } catch (error) {
    console.error("Database Error (History):", error);
    return NextResponse.json({ error: "فشل الاتصال بقاعدة البيانات" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "معرف الطلب مفقود" }, { status: 400 });
  }

  try {
    await prisma.order.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Order Error (History):", error);
    return NextResponse.json({ error: "فشل حذف الطلب نهائياً" }, { status: 500 });
  }
}
