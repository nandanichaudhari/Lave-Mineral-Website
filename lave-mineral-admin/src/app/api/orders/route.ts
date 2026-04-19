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

      // bulk-order friendly optional fields
      orderType = "Normal",
      bulkOrder = false,
      companyName = "",
      category = "",
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
      parsedBoxes >= 200 ||
      String(category).toLowerCase() === "bulk" ||
      String(packaging).toLowerCase().includes("bulk") ||
      String(notes).toLowerCase().includes("bulk") ||
      String(companyName).trim().length > 0;

    const generatedOrderId = generateOrderId();

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
    };

    // Add bulk-order related fields only when present / useful
    if (safeBulkOrder) {
      orderPayload.bulkOrder = true;
      orderPayload.orderType = "Bulk";
    } else {
      orderPayload.orderType = "Normal";
    }

    if (String(companyName).trim()) {
      orderPayload.companyName = String(companyName).trim();
    }

    if (String(category).trim()) {
      orderPayload.category = String(category).trim();
    }

    const order = await Order.create(orderPayload);

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        orderId: generatedOrderId,
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