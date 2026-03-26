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

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, nameEn, nameAr, price, category, imageUrl, descriptionAr, descriptionEn } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        nameEn,
        nameAr,
        price: parseFloat(price),
        category,
        imageUrl,
        descriptionAr,
        descriptionEn
      }
    });

    revalidatePath("/");
    return NextResponse.json(product);
  } catch (error) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: "فشل تحديث المنتج" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, isAvailable } = body;

    const product = await prisma.product.update({
      where: { id },
      data: { isAvailable }
    });

    revalidatePath("/");
    return NextResponse.json(product);
  } catch (error) {
    console.error("Toggle Product Error:", error);
    return NextResponse.json({ error: "فشل تبديل حالة المنتج" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "معرف المنتج مفقود" }, { status: 400 });
  }

  try {
    await prisma.product.delete({
      where: { id }
    });
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: "فشل حذف المنتج" }, { status: 500 });
  }
}
