import mongoose, { Schema, models, model } from "mongoose";

const BulkOrderItemSchema = new Schema(
  {
    productId: {
      type: Number,
      required: true,
    },
    product: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    boxes: {
      type: Number,
      required: true,
      min: 1,
    },
    img: {
      type: String,
      default: "",
    },
    itemTrackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Pending Approval",
        "Confirmed",
        "Processing",
        "Packaging",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending Approval",
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const BulkOrderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    parentOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    totalBoxes: {
      type: Number,
      required: true,
      min: 1,
    },
    totalProducts: {
      type: Number,
      required: true,
      min: 1,
    },

    source: {
      type: String,
      default: "cart-checkout",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending Approval",
        "Confirmed",
        "Processing",
        "Packaging",
        "Partially Shipped",
        "Shipped",
        "Partially Delivered",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending Approval",
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    items: {
      type: [BulkOrderItemSchema],
      default: [],
      validate: {
        validator: function (items: unknown[]) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "At least one bulk order item is required",
      },
    },
  },
  {
    timestamps: true,
  }
);

BulkOrderSchema.pre("save", function () {
  const doc = this as any;

  if (!Array.isArray(doc.items) || doc.items.length === 0) {
    return;
  }

  const statuses = doc.items.map((item: any) => item.status);
  const approvals = doc.items.map((item: any) => item.approvalStatus);

  if (approvals.every((a: string) => a === "Rejected")) {
    doc.approvalStatus = "Rejected";
    doc.status = "Cancelled";
    return;
  }

  if (approvals.every((a: string) => a === "Approved")) {
    doc.approvalStatus = "Approved";
  } else {
    doc.approvalStatus = "Pending";
  }

  if (statuses.every((s: string) => s === "Cancelled")) {
    doc.status = "Cancelled";
  } else if (statuses.every((s: string) => s === "Delivered")) {
    doc.status = "Delivered";
  } else if (statuses.some((s: string) => s === "Delivered")) {
    doc.status = "Partially Delivered";
  } else if (statuses.every((s: string) => s === "Shipped")) {
    doc.status = "Shipped";
  } else if (statuses.some((s: string) => s === "Shipped")) {
    doc.status = "Partially Shipped";
  } else if (statuses.some((s: string) => s === "Packaging")) {
    doc.status = "Packaging";
  } else if (statuses.some((s: string) => s === "Processing")) {
    doc.status = "Processing";
  } else if (statuses.some((s: string) => s === "Confirmed")) {
    doc.status = "Confirmed";
  } else {
    doc.status = "Pending Approval";
  }
});

const BulkOrder =
  models.BulkOrder || model("BulkOrder", BulkOrderSchema);

export default BulkOrder;