import { prisma } from "@/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const zones = await prisma.deliveryZone.findMany({
      orderBy: { nameAr: 'asc' }
    });
    return NextResponse.json(zones);
  } catch (error) {
    console.error("Public Delivery Zones Error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery zones" }, { status: 500 });
  }
}
