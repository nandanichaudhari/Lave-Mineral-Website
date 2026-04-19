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

    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { success: true, orders: [] },
        { status: 200 }
      );
    }

    const groupedMap = new Map<string, any>();
    const normalOrders: any[] = [];

    for (const order of orders) {
      const isBulk =
        order.bulkOrder === true ||
        order.orderType === "Bulk" ||
        !!order.mainOrderId;

      if (!isBulk) {
        normalOrders.push({
          ...order,
          kind: "single",
          childOrders: [],
        });
        continue;
      }

      const mainOrderId =
        String(order.mainOrderId || "").trim() ||
        String(order.orderId || "").trim();

      if (!mainOrderId) {
        normalOrders.push({
          ...order,
          kind: "single",
          childOrders: [],
        });
        continue;
      }

      if (!groupedMap.has(mainOrderId)) {
        groupedMap.set(mainOrderId, {
          _id: order._id,
          kind: "bulk",
          bulkOrder: true,
          orderType: "Bulk",
          orderId: mainOrderId,
          mainOrderId,
          userId: order.userId || "",
          name: order.name || "",
          email: order.email || "",
          phone: order.phone || "",
          address: order.address || "",
          city: order.city || "",
          state: order.state || "",
          pincode: order.pincode || "",
          product: "",
          size: "",
          packaging: order.packaging || "",
          payment: order.payment || "COD",
          totalAmount: 0,
          paidAmount: 0,
          remainingAmount: 0,
          discount: 0,
          paymentStatus: "Pending",
          approvalStatus: order.approvalStatus || "Pending",
          status: order.status || "Pending Approval",
          notes: order.notes || "",
          companyName: order.companyName || "",
          category: order.category || "Bulk",
          totalBoxes: 0,
          totalProducts: 0,
          source: order.source || "",
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          childOrders: [],
        });
      }

      const group = groupedMap.get(mainOrderId);

      const childOrder = {
        ...order,
        mainOrderId,
      };

      group.childOrders.push(childOrder);

      group.totalBoxes += Number(order.boxes || 0);
      group.totalAmount += Number(order.totalAmount || 0);
      group.paidAmount += Number(order.paidAmount || 0);
      group.remainingAmount += Number(order.remainingAmount || 0);
      group.discount += Number(order.discount || 0);
      group.totalProducts = group.childOrders.length;

      if (!group.companyName && order.companyName) {
        group.companyName = order.companyName;
      }

      if (!group.packaging && order.packaging) {
        group.packaging = order.packaging;
      }

      if (!group.notes && order.notes) {
        group.notes = order.notes;
      }

      const statuses = group.childOrders.map(
        (item: any) => item.status || "Pending Approval"
      );
      const approvals = group.childOrders.map(
        (item: any) => item.approvalStatus || "Pending"
      );
      const payments = group.childOrders.map(
        (item: any) => item.paymentStatus || "Pending"
      );

      group.status = statuses.every((s: string) => s === "Delivered")
        ? "Delivered"
        : statuses.every((s: string) => s === "Shipped")
        ? "Shipped"
        : statuses.some((s: string) => s === "Packaging")
        ? "Packaging"
        : statuses.some((s: string) => s === "Processing")
        ? "Processing"
        : statuses.some((s: string) => s === "Confirmed")
        ? "Confirmed"
        : statuses.every((s: string) => s === "Cancelled")
        ? "Cancelled"
        : "Pending Approval";

      group.approvalStatus = approvals.every((a: string) => a === "Approved")
        ? "Approved"
        : approvals.every((a: string) => a === "Rejected")
        ? "Rejected"
        : "Pending";

      group.paymentStatus = payments.every((p: string) => p === "Paid")
        ? "Paid"
        : payments.some((p: string) => p === "Partial" || p === "Paid")
        ? "Partial"
        : "Pending";

      const firstChild = group.childOrders[0];

      if (group.childOrders.length === 1) {
        group.product = firstChild?.product || "Product";
        group.size = firstChild?.size || "-";
      } else {
        group.product = `${group.childOrders.length} products`;
        group.size = `${group.childOrders.length} item sizes`;
      }
    }

    const bulkOrders = Array.from(groupedMap.values()).sort(
      (a: any, b: any) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    );

    const finalOrders = [...bulkOrders, ...normalOrders].sort(
      (a: any, b: any) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
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