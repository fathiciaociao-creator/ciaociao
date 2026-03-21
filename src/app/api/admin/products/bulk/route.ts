import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { ids, category } = await req.json();

    if (!Array.isArray(ids) || !category) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const result = await prisma.product.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        category: category
      }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Bulk Product Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
