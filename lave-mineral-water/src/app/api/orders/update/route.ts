import { NextResponse } from "next/server";
import Order from "@/models/Order";
import {connectDB} from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { orderId, updates } = await req.json();

    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json({ error: "Order not found" });
    }

    // 🔥 LOCK AFTER PACKAGING
    if (
      order.status === "Packaging" ||
      order.status === "Shipped" ||
      order.status === "Delivered"
    ) {
      return NextResponse.json({
        error: "Order cannot be updated after packaging",
      });
    }

    // ✅ UPDATE
    Object.assign(order, updates);
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" });
  }
}