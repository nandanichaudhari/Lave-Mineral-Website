import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

const VALID_STATUS = [
  "Pending Approval",
  "Confirmed",
  "Processing",
  "Packaging",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

const VALID_APPROVAL = ["Pending", "Approved", "Rejected"] as const;
const VALID_PAYMENT_STATUS = ["Pending", "Partial", "Paid"] as const;

type OrderStatus = (typeof VALID_STATUS)[number];
type ApprovalStatus = (typeof VALID_APPROVAL)[number];
type PaymentStatus = (typeof VALID_PAYMENT_STATUS)[number];

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      orderId,
      status,
      approvalStatus,
      totalAmount,
      discount,
      paidAmount,
      notes,
    } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid Order ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // =========================
    // Approval Handling
    // =========================
    if (approvalStatus !== undefined) {
      if (!VALID_APPROVAL.includes(approvalStatus)) {
        return NextResponse.json(
          { success: false, error: "Invalid approval status" },
          { status: 400 }
        );
      }

      order.approvalStatus = approvalStatus as ApprovalStatus;

      if (
        approvalStatus === "Approved" &&
        order.status === "Pending Approval"
      ) {
        order.status = "Confirmed";
      }

      if (approvalStatus === "Rejected") {
        order.status = "Cancelled";
      }

      if (approvalStatus === "Pending") {
        order.status = "Pending Approval";
      }
    }

    // =========================
    // Order Status Handling
    // =========================
    if (status !== undefined) {
      if (!VALID_STATUS.includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid order status" },
          { status: 400 }
        );
      }

      const nextStatus = status as OrderStatus;

      const isBlockedByApproval =
        order.approvalStatus !== "Approved" &&
        !["Pending Approval", "Cancelled"].includes(nextStatus);

      if (isBlockedByApproval) {
        return NextResponse.json(
          {
            success: false,
            error: "Approve the order before moving to processing states",
          },
          { status: 400 }
        );
      }

      if (order.approvalStatus === "Rejected" && nextStatus !== "Cancelled") {
        return NextResponse.json(
          {
            success: false,
            error: "Rejected orders can only remain cancelled",
          },
          { status: 400 }
        );
      }

      order.status = nextStatus;
    }

    // =========================
    // Payment Handling
    // =========================
    const nextTotal =
      totalAmount !== undefined
        ? Number(totalAmount)
        : Number(order.totalAmount || 0);

    const nextDiscount =
      discount !== undefined
        ? Number(discount)
        : Number(order.discount || 0);

    const nextPaid =
      paidAmount !== undefined
        ? Number(paidAmount)
        : Number(order.paidAmount || 0);

    if (
      [nextTotal, nextDiscount, nextPaid].some(
        (value) => Number.isNaN(value) || value < 0
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid payment values" },
        { status: 400 }
      );
    }

    if (nextDiscount > nextTotal) {
      return NextResponse.json(
        { success: false, error: "Discount cannot be greater than total amount" },
        { status: 400 }
      );
    }

    const finalAmount = nextTotal - nextDiscount;
    const remainingAmount = Math.max(finalAmount - nextPaid, 0);

    let paymentStatus: PaymentStatus = "Pending";

    if (nextPaid <= 0) {
      paymentStatus = "Pending";
    } else if (nextPaid < finalAmount) {
      paymentStatus = "Partial";
    } else {
      paymentStatus = "Paid";
    }

    order.totalAmount = nextTotal;
    order.discount = nextDiscount;
    order.paidAmount = nextPaid;
    order.remainingAmount = remainingAmount;
    order.paymentStatus = paymentStatus;

    if (typeof notes === "string") {
      order.notes = notes.trim();
    }

    await order.save();

    return NextResponse.json(
      {
        success: true,
        message: "Order updated successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN ORDER UPDATE ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}