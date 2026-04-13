import mongoose, { Schema, model, models } from "mongoose";

/* =========================
   🔹 CART ITEM SCHEMA
========================= */
const CartItemSchema = new Schema(
  {
    productId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    img: {
      type: String,
      default: "",
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    _id: false, // 🔥 no separate _id for items
  }
);

/* =========================
   🔹 CART MAIN SCHEMA
========================= */
const CartSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // 🔥 one cart per user
      index: true,
    },

    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true, // 🔥 createdAt, updatedAt
  }
);

/* =========================
   🔹 MODEL EXPORT
========================= */
const Cart =
  models.Cart || model("Cart", CartSchema);

export default Cart;