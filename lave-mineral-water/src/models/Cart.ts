import mongoose, { Schema, model, models } from "mongoose";

const CartItemSchema = new Schema(
  {
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    img: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const CartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Cart = models.Cart || model("Cart", CartSchema);

export default Cart;