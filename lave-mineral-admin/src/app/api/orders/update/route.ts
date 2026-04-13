import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId, updates } = await req.json();

    if (!orderId || !updates) {
      return NextResponse.json(
        { error: "Order ID and updates are required" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (
      order.status === "Packaging" ||
      order.status === "Shipped" ||
      order.status === "Delivered"
    ) {
      return NextResponse.json(
        { error: "Order cannot be updated after packaging" },
        { status: 400 }
      );
    }

    Object.assign(order, updates);
    await order.save();

    return NextResponse.json(
      {
        success: true,
        message: "Order updated successfully",
        order,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("ORDER UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}