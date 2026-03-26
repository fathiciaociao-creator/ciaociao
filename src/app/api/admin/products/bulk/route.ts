import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/security/auth";
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { ids, category, action = 'add', isAvailable } = await req.json();

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "IDs must be an array" }, { status: 400 });
    }

    // Handle isAvailable toggle bulk
    if (typeof isAvailable === 'boolean') {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { isAvailable }
      });
      revalidatePath("/");
      return NextResponse.json({ success: true, count: ids.length });
    }

    // Handle category update bulk
    if (category) {
      if (action === 'replace') {
        await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { category: category }
        });
      } else {
        // Append category
        const products = await prisma.product.findMany({
          where: { id: { in: ids } },
          select: { id: true, category: true }
        });

        const updates = products.map(p => {
          const currentCats = p.category ? p.category.split(',').map(c => c.trim()).filter(Boolean) : [];
          if (!currentCats.includes(category.trim())) {
            currentCats.push(category.trim());
          }
          return prisma.product.update({
            where: { id: p.id },
            data: { category: currentCats.join(', ') }
          });
        });
        await prisma.$transaction(updates);
      }
      revalidatePath("/");
      return NextResponse.json({ success: true, count: ids.length });
    }

    return NextResponse.json({ error: "No valid action provided" }, { status: 400 });
  } catch (error) {
    console.error("Bulk Product Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "IDs must be an array" }, { status: 400 });
    }

    await prisma.product.deleteMany({
      where: { id: { in: ids } }
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("Bulk Product Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
