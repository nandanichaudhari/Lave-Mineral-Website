import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
const VALID_ORDER_TYPE = ["Normal", "Bulk"] as const;

type OrderStatus = (typeof VALID_STATUS)[number];
type ApprovalStatus = (typeof VALID_APPROVAL)[number];
type PaymentStatus = (typeof VALID_PAYMENT_STATUS)[number];
type OrderType = (typeof VALID_ORDER_TYPE)[number];

export async function POST(req: Request) {
  try {
    await connectDB();

    // ✅ ADMIN AUTH CHECK (IMPORTANT)
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      orderId,
      status,
      approvalStatus,
      totalAmount,
      discount,
      paidAmount,
      notes,

      // bulk fields
      orderType,
      bulkOrder,
      companyName,
      category,
      packaging,
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
    // APPROVAL LOGIC
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
    // STATUS LOGIC
    // =========================
    if (status !== undefined) {
      if (!VALID_STATUS.includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid order status" },
          { status: 400 }
        );
      }

      const nextStatus = status as OrderStatus;

      const blocked =
        order.approvalStatus !== "Approved" &&
        !["Pending Approval", "Cancelled"].includes(nextStatus);

      if (blocked) {
        return NextResponse.json(
          {
            success: false,
            error: "Approve order before processing",
          },
          { status: 400 }
        );
      }

      if (order.approvalStatus === "Rejected" && nextStatus !== "Cancelled") {
        return NextResponse.json(
          {
            success: false,
            error: "Rejected orders must stay cancelled",
          },
          { status: 400 }
        );
      }

      order.status = nextStatus;
    }

    // =========================
    // PAYMENT LOGIC
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
        (v) => Number.isNaN(v) || v < 0
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid payment values" },
        { status: 400 }
      );
    }

    if (nextDiscount > nextTotal) {
      return NextResponse.json(
        { success: false, error: "Discount > total not allowed" },
        { status: 400 }
      );
    }

    const finalAmount = nextTotal - nextDiscount;
    const remainingAmount = Math.max(finalAmount - nextPaid, 0);

    let paymentStatus: PaymentStatus = "Pending";

    if (nextPaid <= 0) paymentStatus = "Pending";
    else if (nextPaid < finalAmount) paymentStatus = "Partial";
    else paymentStatus = "Paid";

    order.totalAmount = nextTotal;
    order.discount = nextDiscount;
    order.paidAmount = nextPaid;
    order.remainingAmount = remainingAmount;
    order.paymentStatus = paymentStatus;

    // =========================
    // NOTES
    // =========================
    if (typeof notes === "string") {
      order.notes = notes.trim();
    }

    // =========================
    // BULK LOGIC
    // =========================
    const safeOrderType: OrderType | undefined =
      typeof orderType === "string" &&
      VALID_ORDER_TYPE.includes(orderType as OrderType)
        ? (orderType as OrderType)
        : undefined;

    const nextCompanyName =
      typeof companyName === "string" ? companyName.trim() : undefined;

    const nextCategory =
      typeof category === "string" ? category.trim() : undefined;

    const nextPackaging =
      typeof packaging === "string" ? packaging.trim() : undefined;

    const shouldBeBulk =
      bulkOrder === true ||
      safeOrderType === "Bulk" ||
      String(nextCategory || "").toLowerCase() === "bulk" ||
      String(nextPackaging || "").toLowerCase().includes("bulk") ||
      String(order.notes || "").toLowerCase().includes("bulk") ||
      Boolean(nextCompanyName) ||
      Number(order.boxes || 0) >= 200;

    if (safeOrderType !== undefined) {
      order.orderType = safeOrderType;
    }

    if (typeof bulkOrder === "boolean") {
      order.bulkOrder = bulkOrder;
    }

    if (nextCompanyName !== undefined) {
      order.companyName = nextCompanyName;
    }

    if (nextCategory !== undefined) {
      order.category = nextCategory;
    }

    if (nextPackaging !== undefined) {
      order.packaging = nextPackaging;
    }

    if (shouldBeBulk) {
      order.bulkOrder = true;
      order.orderType = "Bulk";
    } else if (bulkOrder === false || safeOrderType === "Normal") {
      order.bulkOrder = false;
      order.orderType = "Normal";
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