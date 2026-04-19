import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin login required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const orderId = body?.orderId?.trim();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const directOrder = await Order.findOne({
      orderId,
    }).lean<any>();

    if (directOrder) {
      const isBulkItem =
        Boolean(directOrder.bulkOrder) && Boolean(directOrder.mainOrderId);

      return NextResponse.json(
        {
          success: true,
          order: {
            type: isBulkItem ? "bulk-item" : "single",
            orderId: directOrder.orderId,
            parentOrderId: isBulkItem ? directOrder.mainOrderId : undefined,
            name: directOrder.name,
            product: directOrder.product,
            size: directOrder.size,
            boxes: directOrder.boxes,
            status: directOrder.status,
            approvalStatus: directOrder.approvalStatus,
            paymentStatus: directOrder.paymentStatus,
            totalAmount: directOrder.totalAmount,
            paidAmount: directOrder.paidAmount,
            remainingAmount: directOrder.remainingAmount,
            createdAt: directOrder.createdAt,
            updatedAt: directOrder.updatedAt,
          },
        },
        { status: 200 }
      );
    }

    const bulkOrders = await Order.find({
      mainOrderId: orderId,
      bulkOrder: true,
    })
      .sort({ createdAt: 1 })
      .lean<any[]>();

    if (bulkOrders.length > 0) {
      const base = bulkOrders[0];

      const totalBoxes = bulkOrders.reduce(
        (sum, item) => sum + Number(item.boxes || 0),
        0
      );

      const totalAmount = bulkOrders.reduce(
        (sum, item) => sum + Number(item.totalAmount || 0),
        0
      );

      const paidAmount = bulkOrders.reduce(
        (sum, item) => sum + Number(item.paidAmount || 0),
        0
      );

      const remainingAmount = bulkOrders.reduce(
        (sum, item) => sum + Number(item.remainingAmount || 0),
        0
      );

      const statuses = bulkOrders.map((item) => item.status);
      const approvals = bulkOrders.map((item) => item.approvalStatus);
      const payments = bulkOrders.map((item) => item.paymentStatus);

      const derivedStatus = statuses.every((s) => s === "Delivered")
        ? "Delivered"
        : statuses.every((s) => s === "Shipped")
        ? "Shipped"
        : statuses.some((s) => s === "Packaging")
        ? "Packaging"
        : statuses.some((s) => s === "Processing")
        ? "Processing"
        : statuses.some((s) => s === "Confirmed")
        ? "Confirmed"
        : statuses.every((s) => s === "Cancelled")
        ? "Cancelled"
        : "Pending Approval";

      const derivedApproval = approvals.every((a) => a === "Approved")
        ? "Approved"
        : approvals.every((a) => a === "Rejected")
        ? "Rejected"
        : "Pending";

      const derivedPayment = payments.every((p) => p === "Paid")
        ? "Paid"
        : payments.some((p) => p === "Partial" || p === "Paid")
        ? "Partial"
        : "Pending";

      return NextResponse.json(
        {
          success: true,
          order: {
            type: "bulk-parent",
            orderId,
            parentOrderId: orderId,
            name: base.name,
            totalBoxes,
            totalProducts: bulkOrders.length,
            status: derivedStatus,
            approvalStatus: derivedApproval,
            paymentStatus: derivedPayment,
            totalAmount,
            paidAmount,
            remainingAmount,
            createdAt: base.createdAt,
            updatedAt: base.updatedAt,
            items: bulkOrders.map((item) => ({
              product: item.product,
              size: item.size,
              boxes: item.boxes,
              itemTrackingId: item.orderId,
              status: item.status,
              approvalStatus: item.approvalStatus,
              paymentStatus: item.paymentStatus,
              totalAmount: item.totalAmount,
              paidAmount: item.paidAmount,
              remainingAmount: item.remainingAmount,
            })),
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Order not found" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("ADMIN TRACK ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Tracking failed",
      },
      { status: 500 }
    );
  }
}