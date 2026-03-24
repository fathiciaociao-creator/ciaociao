import { prisma } from "../../../../db"; 
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/security/auth";

export const dynamic = 'force-dynamic'; 

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "قاعدة البيانات غير متصلة (DATABASE_URL مفقود)" }, 
      { status: 500 }
    );
  }

  try {
    // جلب الطلبات مع الأصناف التابعة لها وبيانات المستخدم إن وجدت
    const allOrders = await prisma.order.findMany({
      where: { isArchived: false },
      include: {
        items: true,
        user: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(allOrders);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "فشل الاتصال بقاعدة البيانات" }, { status: 500 });
  }
}