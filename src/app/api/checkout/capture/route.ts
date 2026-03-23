// src/app/api/checkout/capture/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { capturePayPalOrder } from "@/lib/paypal";
import { DELIVERY_ZONES } from "@/constants/deliveryZones";

export async function POST(request: Request) {
  try {
    const { paypalOrderId, orderData } = await request.json();

    if (!paypalOrderId || !orderData) {
      return NextResponse.json({ success: false, error: "Missing order information" }, { status: 400 });
    }

    // 1. Capture the order with PayPal
    const captureData = await capturePayPalOrder(paypalOrderId);
    
    if (captureData.status !== "COMPLETED") {
       return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 });
    }

    const payPalAmount = parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value);
    
    // 2. Server-side Zero-Trust Price Recalculation (JOD)
    const productIds = orderData.items.map((item: { productId: string }) => item.productId);
    const dbProducts = await prisma.product.findMany({
       where: { id: { in: productIds } }
    });
    
    const productPriceMap = new Map(dbProducts.map(p => [p.id, p.price]));
    let calculatedJODTotal = 0;
    const itemsToCreate = [];

    for (const item of orderData.items) {
       const dbPrice = productPriceMap.get(item.productId);
       if (dbPrice === undefined) {
          return NextResponse.json({ success: false, error: "Product not found" }, { status: 400 });
       }
       calculatedJODTotal += Number(dbPrice) * item.quantity;
       itemsToCreate.push({
          productId: item.productId,
          name: item.name,
          price: Number(dbPrice),
          quantity: item.quantity
       });
    }

    // Add Delivery Fee
    let deliveryFee = 0;
    if (orderData.orderType === 'DELIVERY') {
       const zone = DELIVERY_ZONES.find(z => z.nameEn === orderData.deliveryArea);
       deliveryFee = zone ? zone.fee : 0;
    }

    // Add Service Fee (Fixed at 0.26 as per PaymentPage)
    const serviceFee = 0.26;
    
    // Apply Discount
    let discountAmount = 0;
    if (orderData.couponCode) {
       const coupon = await prisma.coupon.findUnique({ where: { code: orderData.couponCode.toUpperCase() } });
       if (coupon && coupon.isActive) {
          discountAmount = calculatedJODTotal * (coupon.discountPercent / 100);
       }
    }

    const finalJODTotal = calculatedJODTotal + deliveryFee + serviceFee - discountAmount;
    
    // 3. Convert to USD and Verify match (Rate: 0.708)
    const expectedUSDAmount = parseFloat((finalJODTotal / 0.708).toFixed(2));

    // Threshold check for floating point precision
    if (Math.abs(payPalAmount - expectedUSDAmount) > 0.05) {
       console.error(`PRICE MISMATCH: PayPal(${payPalAmount}) vs Server(${expectedUSDAmount})`);
       return NextResponse.json({ success: false, error: "Tampering detected: Price mismatch" }, { status: 400 });
    }

    // 4. Finalize the order in the database
    const newOrder = await prisma.order.create({
       data: {
          customerName: orderData.customerName,
          phoneNumber: orderData.phone,
          address: orderData.address || null,
          deliveryArea: orderData.deliveryArea || null,
          pickupTime: orderData.pickupTime || null,
          orderType: orderData.orderType,
          notes: orderData.notes || null,
          totalPrice: parseFloat(finalJODTotal.toFixed(2)),
          userId: orderData.userId || null,
          couponCode: orderData.couponCode || null,
          paymentMethod: 'PAYPAL',
          paymentStatus: 'COMPLETED',
          items: {
             create: itemsToCreate
          }
       }
    });

    // Notify Admins (Logic borrowed from api/order/route.ts)
    try {
       const subscriptions = await prisma.pushSubscription.findMany();
       if (subscriptions.length > 0) {
          const { sendOrderNotification } = await import('@/lib/push');
          await Promise.allSettled(subscriptions.map(sub => sendOrderNotification(sub, newOrder.id, newOrder.totalPrice)));
       }
       const { sendPushoverNotification } = await import('@/lib/pushover');
       await sendPushoverNotification(newOrder.id, newOrder.totalPrice, newOrder.customerName);
    } catch (e) { console.error("Notification failed", e); }

    return NextResponse.json({ success: true, orderId: newOrder.id });

  } catch (error) {
    console.error("Capture Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
