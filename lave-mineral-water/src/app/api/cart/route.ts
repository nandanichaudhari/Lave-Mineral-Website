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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json({ success: true, cart }, { status: 200 });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = String(session.user.id);
    const { product } = await req.json();

    if (
      !product ||
      product.productId === undefined ||
      !product.name ||
      !product.size ||
      product.qty === undefined ||
      product.qty === null
    ) {
      return NextResponse.json(
        { error: "Invalid product data" },
        { status: 400 }
      );
    }

    const productId = Number(product.productId);
    const qty = Number(product.qty);

    if (!qty || qty < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    // 1) Try increasing existing item quantity atomically
    let cart = await Cart.findOneAndUpdate(
      {
        userId,
        "items.productId": productId,
      },
      {
        $inc: { "items.$.qty": qty },
      },
      {
        new: true,
      }
    );

    // 2) If item does not exist, push new item atomically
    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        {
          userId,
        },
        {
          $setOnInsert: { userId },
          $push: {
            items: {
              productId,
              name: String(product.name),
              size: String(product.size),
              img: String(product.img || ""),
              qty,
            },
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    return NextResponse.json({ success: true, cart }, { status: 200 });
  } catch (error) {
    console.error("ADD CART ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = String(session.user.id);
    const { productId, action } = await req.json();

    if (productId === undefined || !action) {
      return NextResponse.json(
        { error: "Product ID and action are required" },
        { status: 400 }
      );
    }

    const parsedProductId = Number(productId);

    const cart = await Cart.findOne({ userId }).lean();

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    const existingItem = Array.isArray(cart.items)
      ? cart.items.find(
          (item: any) => Number(item.productId) === parsedProductId
        )
      : null;

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    let updatedCart = null;

    if (action === "increase") {
      updatedCart = await Cart.findOneAndUpdate(
        {
          userId,
          "items.productId": parsedProductId,
        },
        {
          $inc: { "items.$.qty": 1 },
        },
        { new: true }
      );
    } else if (action === "decrease") {
      if (Number(existingItem.qty) > 1) {
        updatedCart = await Cart.findOneAndUpdate(
          {
            userId,
            "items.productId": parsedProductId,
          },
          {
            $inc: { "items.$.qty": -1 },
          },
          { new: true }
        );
      } else {
        updatedCart = await Cart.findOneAndUpdate(
          { userId },
          {
            $pull: {
              items: { productId: parsedProductId },
            },
          },
          { new: true }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, cart: updatedCart },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH CART ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update quantity" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = String(session.user.id);
    const { productId } = await req.json();

    if (productId === undefined || productId === null) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    const parsedProductId = Number(productId);

    const cart = await Cart.findOneAndUpdate(
      { userId },
      {
        $pull: {
          items: { productId: parsedProductId },
        },
      },
      { new: true }
    );

    if (!cart) {
      return NextResponse.json(
        { success: true, cart: { userId, items: [] } },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, cart }, { status: 200 });
  } catch (error) {
    console.error("DELETE CART ERROR:", error);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    );
  }
}