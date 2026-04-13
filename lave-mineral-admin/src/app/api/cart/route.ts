import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = String(session.user.id);

    let cart = await Cart.findOne({ userId }).lean();

    if (!cart) {
      const createdCart = await Cart.create({
        userId,
        items: [],
      });

      cart = createdCart.toObject();
    }

    return NextResponse.json(
      { success: true, cart },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET CART ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
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

    const userId = String(session.user.id);
    const { product } = await req.json();

    if (
      !product ||
      product.productId === undefined ||
      !product.name ||
      !product.size ||
      !product.qty
    ) {
      return NextResponse.json(
        { error: "Invalid product data" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [
          {
            productId: Number(product.productId),
            name: product.name,
            size: product.size,
            img: product.img || "",
            qty: Number(product.qty),
          },
        ],
      });
    } else {
      const index = cart.items.findIndex(
        (item: any) => Number(item.productId) === Number(product.productId)
      );

      if (index > -1) {
        cart.items[index].qty += Number(product.qty);
      } else {
        cart.items.push({
          productId: Number(product.productId),
          name: product.name,
          size: product.size,
          img: product.img || "",
          qty: Number(product.qty),
        });
      }

      await cart.save();
    }

    return NextResponse.json(
      { success: true, cart },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADD CART ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = String(session.user.id);
    const { productId } = await req.json();

    if (productId === undefined || productId === null) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return NextResponse.json(
        { success: true, cart: { userId, items: [] } },
        { status: 200 }
      );
    }

    cart.items = cart.items.filter(
      (item: any) => Number(item.productId) !== Number(productId)
    );

    await cart.save();

    return NextResponse.json(
      { success: true, cart },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE CART ERROR:", error);

    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    );
  }
}