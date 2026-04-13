import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 Get session
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

    // 🔍 Find order (user-specific)
    const order = await Order.findOne({
      orderId,
      userId: String(session.user.id),
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 🔒 Normalize status (important fix)
    const status = order.status?.toLowerCase();

    // ❌ Already cancelled
    if (status === "cancelled") {
      return NextResponse.json(
        { error: "Order already cancelled" },
        { status: 400 }
      );
    }

    // ❌ Block after packaging
    if (
      status === "packaging" ||
      status === "shipped" ||
      status === "delivered"
    ) {
      return NextResponse.json(
        { error: "Order cannot be cancelled after packaging has started" },
        { status: 400 }
      );
    }

    // ✅ Cancel allowed
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