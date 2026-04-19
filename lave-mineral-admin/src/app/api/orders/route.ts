import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { generateOrderId } from "@/utils/generateOrderId";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email || "";

    const body = await req.json();

    const {
      name,
      phone,
      address,
      city = "",
      state = "",
      pincode = "",
      product,
      size,
      packaging = "",
      boxes,
      payment = "COD",
      totalAmount = 0,
      paidAmount = 0,
      discount = 0,
      notes = "",
      orderType = "Normal",
      bulkOrder = false,
      companyName = "",
      category = "",
      mainOrderId = "",
      totalBoxes = 0,
      totalProducts = 0,
      source = "",
    } = body;

    if (!name || !phone || !address || !product || !size) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const parsedBoxes = Number(boxes);
    const parsedTotal = Number(totalAmount);
    const parsedPaid = Number(paidAmount);
    const parsedDiscount = Number(discount);
    const parsedTotalBoxes = Number(totalBoxes || 0);
    const parsedTotalProducts = Number(totalProducts || 0);

    if (!parsedBoxes || parsedBoxes < 1) {
      return NextResponse.json(
        { error: "Minimum 1 box required" },
        { status: 400 }
      );
    }

    const safeOrderType =
      String(orderType).toLowerCase() === "bulk" ? "Bulk" : "Normal";

    const safeBulkOrder =
      Boolean(bulkOrder) ||
      safeOrderType === "Bulk" ||
      String(mainOrderId).trim().length > 0 ||
      parsedTotalProducts > 1 ||
      parsedTotalBoxes >= 50 ||
      parsedBoxes >= 200 ||
      String(category).toLowerCase() === "bulk" ||
      String(packaging).toLowerCase().includes("bulk") ||
      String(notes).toLowerCase().includes("bulk") ||
      String(companyName).trim().length > 0;

    const generatedOrderId = generateOrderId();

    const finalMainOrderId = safeBulkOrder
      ? String(mainOrderId).trim() || generatedOrderId
      : "";

    const orderPayload: Record<string, any> = {
      userId,
      orderId: generatedOrderId,
      name,
      email: userEmail,
      phone,
      address,
      city,
      state,
      pincode,
      product,
      size,
      packaging,
      boxes: parsedBoxes,
      payment,
      totalAmount: parsedTotal,
      paidAmount: parsedPaid,
      discount: parsedDiscount,
      notes,
      approvalStatus: "Pending",
      status: "Pending Approval",
      paymentStatus:
        parsedPaid <= 0
          ? "Pending"
          : parsedPaid < parsedTotal - parsedDiscount
          ? "Partial"
          : "Paid",
    };

    if (safeBulkOrder) {
      orderPayload.bulkOrder = true;
      orderPayload.orderType = "Bulk";
      orderPayload.mainOrderId = finalMainOrderId;
      orderPayload.totalBoxes = parsedTotalBoxes > 0 ? parsedTotalBoxes : parsedBoxes;
      orderPayload.totalProducts = parsedTotalProducts > 0 ? parsedTotalProducts : 1;
    } else {
      orderPayload.bulkOrder = false;
      orderPayload.orderType = "Normal";
    }

    if (String(companyName).trim()) {
      orderPayload.companyName = String(companyName).trim();
    }

    if (String(category).trim()) {
      orderPayload.category = String(category).trim();
    }

    if (String(source).trim()) {
      orderPayload.source = String(source).trim();
    }

    const order = await Order.create(orderPayload);

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        orderId: generatedOrderId,
        mainOrderId: safeBulkOrder ? finalMainOrderId : "",
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST ORDER ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}