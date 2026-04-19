import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { generateOrderId } from "@/utils/generateOrderId";

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

    const body = await req.json();

    const {
      customer,
      items,
      totalBoxes,
      totalProducts,
      source = "cart-checkout",
    } = body || {};

    if (!customer || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Customer details and items are required" },
        { status: 400 }
      );
    }

    const {
      name,
      email = session.user.email || "",
      phone,
      address,
      city = "",
      state = "",
      pincode = "",
    } = customer;

    if (!name || !phone || !address) {
      return NextResponse.json(
        { error: "Name, phone and address are required" },
        { status: 400 }
      );
    }

    const parsedTotalBoxes = Number(totalBoxes);
    const parsedTotalProducts = Number(totalProducts);

    if (!parsedTotalBoxes || parsedTotalBoxes < 50) {
      return NextResponse.json(
        { error: "Minimum 50 boxes required for bulk order" },
        { status: 400 }
      );
    }

    if (!parsedTotalProducts || parsedTotalProducts < 1) {
      return NextResponse.json(
        { error: "At least one product is required" },
        { status: 400 }
      );
    }

    const mainOrderId = generateOrderId();

    const normalizedItems = items.map((item: any, index: number) => {
      const parsedBoxes = Number(item?.boxes);

      if (!item?.product || !item?.size || !parsedBoxes || parsedBoxes < 1) {
        throw new Error(`Invalid item at index ${index + 1}`);
      }

      return {
        product: String(item.product).trim(),
        size: String(item.size).trim(),
        boxes: parsedBoxes,
        img: item?.img || "",
        orderId: `${mainOrderId}-${index + 1}`,
      };
    });

    const ordersPayload = normalizedItems.map((item: any) => ({
      userId: String(session.user.id),
      orderId: item.orderId,
      mainOrderId,

      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),

      address: String(address).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim(),

      product: item.product,
      size: item.size,
      packaging: "",

      boxes: item.boxes,

      payment: "COD",
      totalAmount: 0,
      paidAmount: 0,
      discount: 0,
      remainingAmount: 0,
      paymentStatus: "Pending",

      notes: `Bulk order created from ${source}`,
      approvalStatus: "Pending",
      status: "Pending Approval",

      bulkOrder: true,
      orderType: "Bulk",
      category: "Bulk",
      totalProducts: parsedTotalProducts,
      totalBoxes: parsedTotalBoxes,
      source,
    }));

    const createdOrders = await Order.insertMany(ordersPayload);

    return NextResponse.json(
      {
        success: true,
        message: "Bulk order created successfully",
        mainOrderId,
        order: {
          mainOrderId,
          totalBoxes: parsedTotalBoxes,
          totalProducts: parsedTotalProducts,
          status: "Pending Approval",
          approvalStatus: "Pending",
          items: createdOrders.map((item: any) => ({
            product: item.product,
            size: item.size,
            boxes: item.boxes,
            itemTrackingId: item.orderId,
            status: item.status,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST BULK ORDER ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}