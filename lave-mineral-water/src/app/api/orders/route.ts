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

    const generatedOrderId = generateOrderId();

    const order = await Order.create({
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
    });

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