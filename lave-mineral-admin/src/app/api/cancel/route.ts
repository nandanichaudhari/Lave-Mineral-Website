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

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
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
        { error: "Cannot cancel after packaging" },
        { status: 400 }
      );
    }

    order.status = "Cancelled";
    order.approvalStatus = "Rejected";
    await order.save();

    return NextResponse.json(
      {
        success: true,
        message: "Order cancelled successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("CANCEL ORDER ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}