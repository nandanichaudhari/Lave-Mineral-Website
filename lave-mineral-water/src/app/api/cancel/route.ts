import { NextResponse } from "next/server";
import Order from "@/models/Order";
import BulkOrder from "@/models/BulkOrder";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function isLockedStatus(status?: string) {
  const normalized = status?.toLowerCase();
  return (
    normalized === "packaging" ||
    normalized === "shipped" ||
    normalized === "delivered" ||
    normalized === "partially shipped" ||
    normalized === "partially delivered"
  );
}

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

    const userId = String(session.user.id);

    const singleOrder = await Order.findOne({
      orderId,
      userId,
    });

    if (singleOrder) {
      const status = singleOrder.status?.toLowerCase();

      if (status === "cancelled") {
        return NextResponse.json(
          { error: "Order already cancelled" },
          { status: 400 }
        );
      }

      if (isLockedStatus(singleOrder.status)) {
        return NextResponse.json(
          { error: "Order cannot be cancelled after packaging has started" },
          { status: 400 }
        );
      }

      singleOrder.status = "Cancelled";
      singleOrder.approvalStatus = "Rejected";

      await singleOrder.save();

      return NextResponse.json(
        {
          success: true,
          message: "Order cancelled successfully",
        },
        { status: 200 }
      );
    }

    const bulkOrder = await BulkOrder.findOne({
      parentOrderId: orderId,
      userId,
    });

    if (bulkOrder) {
      const lockedItem = bulkOrder.items.find((item: any) =>
        isLockedStatus(item.status)
      );

      if (lockedItem) {
        return NextResponse.json(
          {
            error:
              "Bulk order cannot be cancelled because one or more items have already reached packaging/shipped/delivered stage",
          },
          { status: 400 }
        );
      }

      bulkOrder.items = bulkOrder.items.map((item: any) => ({
        ...item.toObject?.() ?? item,
        status: "Cancelled",
        approvalStatus: "Rejected",
      }));

      bulkOrder.status = "Cancelled";
      bulkOrder.approvalStatus = "Rejected";

      await bulkOrder.save();

      return NextResponse.json(
        {
          success: true,
          message: "Bulk order cancelled successfully",
        },
        { status: 200 }
      );
    }

    const bulkItemOrder = await BulkOrder.findOne({
      userId,
      "items.itemTrackingId": orderId,
    });

    if (bulkItemOrder) {
      const item = bulkItemOrder.items.find(
        (entry: any) => entry.itemTrackingId === orderId
      );

      if (!item) {
        return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
        );
      }

      if (item.status?.toLowerCase() === "cancelled") {
        return NextResponse.json(
          { error: "Item already cancelled" },
          { status: 400 }
        );
      }

      if (isLockedStatus(item.status)) {
        return NextResponse.json(
          { error: "Item cannot be cancelled after packaging has started" },
          { status: 400 }
        );
      }

      item.status = "Cancelled";
      item.approvalStatus = "Rejected";

      await bulkItemOrder.save();

      return NextResponse.json(
        {
          success: true,
          message: "Bulk item cancelled successfully",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  } catch (err) {
    console.error("CANCEL ORDER ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}