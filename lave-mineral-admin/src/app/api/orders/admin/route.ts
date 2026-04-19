import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    if (!Array.isArray(orders)) {
      return NextResponse.json(
        { success: true, orders: [] },
        { status: 200 }
      );
    }

    // ✅ GROUP BULK ORDERS BY mainOrderId
    const groupedMap = new Map<string, any>();

    const normalOrders: any[] = [];

    for (const order of orders) {
      const isBulk = order.bulkOrder === true || order.orderType === "Bulk";

      // 👉 NORMAL ORDER
      if (!isBulk || !order.mainOrderId) {
        normalOrders.push({
          ...order,
          type: "single",
        });
        continue;
      }

      // 👉 BULK ORDER GROUPING
      const key = order.mainOrderId;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          type: "bulk",
          mainOrderId: key,
          name: order.name,
          email: order.email,
          phone: order.phone,

          totalBoxes: order.totalBoxes || 0,
          totalProducts: order.totalProducts || 0,

          status: order.status,
          approvalStatus: order.approvalStatus,

          createdAt: order.createdAt,
          updatedAt: order.updatedAt,

          items: [],
        });
      }

      const group = groupedMap.get(key);

      group.items.push({
        orderId: order.orderId,
        product: order.product,
        size: order.size,
        boxes: order.boxes,
        status: order.status,
        approvalStatus: order.approvalStatus,
      });
    }

    const bulkOrders = Array.from(groupedMap.values());

    // ✅ FINAL RESPONSE (MERGED)
    const finalOrders = [...bulkOrders, ...normalOrders].sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        orders: finalOrders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET ADMIN ORDERS ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}