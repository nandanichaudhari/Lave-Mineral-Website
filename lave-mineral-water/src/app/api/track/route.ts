import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 AUTH CHECK
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const orderId = body?.orderId?.trim();

    // ❌ VALIDATION
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // 🔍 FIND ORDER (STRICT USER BASED)
    const order = await Order.findOne({
      orderId,
      userId: String(session.user.id),
    }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // 🔥 CLEAN RESPONSE (ONLY REQUIRED FIELDS)
    const safeOrder = {
      orderId: order.orderId,
      name: order.name,
      product: order.product,
      size: order.size,
      boxes: order.boxes,

      status: order.status,
      approvalStatus: order.approvalStatus,

      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      remainingAmount: order.remainingAmount,

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        order: safeOrder,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("❌ TRACK ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Tracking failed",
      },
      { status: 500 }
    );
  }
}