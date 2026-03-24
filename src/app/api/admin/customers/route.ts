import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/security/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  try {
    // Unique customers based on phone number
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        customerName: true,
        phoneNumber: true,
        address: true,
        deliveryArea: true,
        totalPrice: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        },
      }
    });

    const customersMap = new Map();
    orders.forEach(order => {
      if (!customersMap.has(order.phoneNumber)) {
        customersMap.set(order.phoneNumber, {
          name: order.customerName,
          phone: order.phoneNumber,
          address: order.address,
          area: order.deliveryArea,
          lastOrder: order.createdAt,
          isUser: !!order.user,
          email: order.user?.email || null,
          orderCount: 1,
          totalSpent: order.totalPrice,
        });
      } else {
        const existing = customersMap.get(order.phoneNumber);
        existing.orderCount += 1;
        existing.totalSpent += order.totalPrice;
        // Keep the latest name/address/email
        if (new Date(order.createdAt) > new Date(existing.lastOrder)) {
          existing.name = order.customerName;
          existing.address = order.address;
          existing.lastOrder = order.createdAt;
          if (order.user?.email) existing.email = order.user.email;
        }
      }
    });

    return NextResponse.json(Array.from(customersMap.values()));
  } catch (error) {
    console.error("Customers API Error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
