import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = String(session.user.id);

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        orders: Array.isArray(orders) ? orders : [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET USER ORDERS ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}