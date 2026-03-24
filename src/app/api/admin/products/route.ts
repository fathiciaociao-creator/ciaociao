import { prisma } from "../../../../db"; 
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/security/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json({ error: "فشل جلب المنتجات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { nameEn, nameAr, price, category, imageUrl, descriptionAr, descriptionEn } = body;

    const product = await prisma.product.create({
      data: {
        nameEn,
        nameAr,
        price: parseFloat(price),
        category,
        imageUrl,
        descriptionAr,
        descriptionEn,
        isAvailable: true
      }
    });

    revalidatePath("/");
    return NextResponse.json(product);
  } catch (error) {
    console.error("Create Product Error:", error);
    return NextResponse.json({ error: "فشل إضافة المنتج" }, { status: 500 });
  }
}
