import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  orderId: string;
  mainOrderId?: string;
  userId?: string | null;

  name: string;
  email: string;
  phone: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  product: string;
  size: string;
  packaging?: string;

  boxes: number;

  payment: "COD" | "Online" | "Bank Transfer";

  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: "Pending" | "Partial" | "Paid";

  discount: number;
  finalAmount: number;

  approvalStatus: "Pending" | "Approved" | "Rejected";

  notes?: string;

  status:
    | "Pending Approval"
    | "Confirmed"
    | "Processing"
    | "Packaging"
    | "Shipped"
    | "Delivered"
    | "Cancelled";

  // Bulk order support
  bulkOrder?: boolean;
  orderType?: "Normal" | "Bulk";
  companyName?: string;
  category?: string;
  totalProducts?: number;
  totalBoxes?: number;
  source?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, unique: true, required: true },
    mainOrderId: { type: String, default: "", index: true },

    userId: { type: String, default: null, index: true },

    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, required: true },

    address: { type: String, required: true },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },

    product: { type: String, required: true },
    size: { type: String, required: true },
    packaging: { type: String, default: "" },

    boxes: { type: Number, required: true, min: 1 },

    payment: {
      type: String,
      enum: ["COD", "Online", "Bank Transfer"],
      default: "COD",
    },

    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },

    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    notes: { type: String, default: "" },

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

    // Bulk order fields
    bulkOrder: { type: Boolean, default: false },
    orderType: {
      type: String,
      enum: ["Normal", "Bulk"],
      default: "Normal",
    },
    companyName: { type: String, default: "" },
    category: { type: String, default: "" },
    totalProducts: { type: Number, default: 0 },
    totalBoxes: { type: Number, default: 0 },
    source: { type: String, default: "" },
  },
  { timestamps: true }
);

OrderSchema.pre("validate", function (this: IOrder) {
  if (!this.orderId) {
    const random = Math.floor(100000 + Math.random() * 900000);
    this.orderId = `REQ-${Date.now()}-${random}`;
  }
});

OrderSchema.pre("save", function (this: IOrder) {
  this.finalAmount = Math.max((this.totalAmount || 0) - (this.discount || 0), 0);
  this.remainingAmount = Math.max(this.finalAmount - (this.paidAmount || 0), 0);

  if (this.paidAmount <= 0) {
    this.paymentStatus = "Pending";
  } else if (this.paidAmount < this.finalAmount) {
    this.paymentStatus = "Partial";
  } else {
    this.paymentStatus = "Paid";
  }

  // Auto bulk detection safety
  const notesValue = (this.notes || "").toLowerCase();
  const packagingValue = (this.packaging || "").toLowerCase();
  const productValue = (this.product || "").toLowerCase();
  const companyValue = (this.companyName || "").trim().toLowerCase();
  const categoryValue = (this.category || "").toLowerCase();

  const shouldBeBulk =
    this.bulkOrder === true ||
    this.orderType === "Bulk" ||
    categoryValue === "bulk" ||
    packagingValue.includes("bulk") ||
    productValue.includes("bulk") ||
    notesValue.includes("bulk") ||
    companyValue.length > 0 ||
    Number(this.totalBoxes || 0) >= 50 ||
    Number(this.boxes || 0) >= 200;

  if (shouldBeBulk) {
    this.bulkOrder = true;
    this.orderType = "Bulk";

    if (!this.category || !this.category.trim()) {
      this.category = "Bulk";
    }
  } else {
    this.bulkOrder = false;
    this.orderType = "Normal";
  }

  // Approval -> status sync only when approval actually changes
  if (this.isModified("approvalStatus")) {
    if (this.approvalStatus === "Approved" && this.status === "Pending Approval") {
      this.status = "Confirmed";
    } else if (this.approvalStatus === "Rejected") {
      this.status = "Cancelled";
    } else if (this.approvalStatus === "Pending") {
      this.status = "Pending Approval";
    }
  }
});

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;