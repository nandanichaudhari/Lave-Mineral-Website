"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  FaUser,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaClipboardCheck,
  FaWallet,
  FaFileAlt,
  FaTruck,
  FaChevronDown,
  FaPhone,
  FaLayerGroup,
  FaBuilding,
  FaTags,
} from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";

type Order = {
  orderId: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  product: string;
  size: string;
  boxes: number;
  payment: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  discount?: number;
  paymentStatus: "Pending" | "Partial" | "Paid";
  approvalStatus: "Pending" | "Approved" | "Rejected";
  status:
    | "Pending Approval"
    | "Confirmed"
    | "Processing"
    | "Packaging"
    | "Shipped"
    | "Delivered"
    | "Cancelled";
  notes?: string;
  createdAt?: string;

  // Optional bulk-order-friendly fields
  orderType?: "Normal" | "Bulk";
  bulkOrder?: boolean;
  companyName?: string;
  packaging?: string;
  category?: string;
};

export default function AdminOrderCard({
  order,
  updateOrder,
}: {
  order: Order;
  updateOrder: (
    orderId: string,
    updates: Partial<{
      approvalStatus: Order["approvalStatus"];
      status: Order["status"];
      totalAmount: number;
      discount: number;
      paidAmount: number;
      notes: string;
    }>
  ) => Promise<void>;
}) {
  const [approvalStatus, setApprovalStatus] = useState(order.approvalStatus);
  const [status, setStatus] = useState(order.status);
  const [totalAmount, setTotalAmount] = useState(String(order.totalAmount || 0));
  const [discount, setDiscount] = useState(String(order.discount || 0));
  const [paidAmount, setPaidAmount] = useState(String(order.paidAmount || 0));
  const [notes, setNotes] = useState(order.notes || "");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isBulkOrder = useMemo(() => {
    const notesValue = (order.notes || "").toLowerCase();
    const packagingValue = (order.packaging || "").toLowerCase();
    const productValue = (order.product || "").toLowerCase();
    const companyValue = (order.companyName || "").toLowerCase();
    const orderTypeValue = (order.orderType || "").toLowerCase();
    const categoryValue = (order.category || "").toLowerCase();

    return Boolean(
      order.bulkOrder ||
        orderTypeValue === "bulk" ||
        categoryValue === "bulk" ||
        packagingValue.includes("bulk") ||
        productValue.includes("bulk") ||
        notesValue.includes("bulk") ||
        companyValue.length > 0 ||
        Number(order.boxes || 0) >= 200
    );
  }, [
    order.bulkOrder,
    order.orderType,
    order.category,
    order.packaging,
    order.product,
    order.notes,
    order.companyName,
    order.boxes,
  ]);

  const liveRemaining = useMemo(() => {
    const total = Number(totalAmount || 0);
    const disc = Number(discount || 0);
    const paid = Number(paidAmount || 0);
    return Math.max(total - disc - paid, 0);
  }, [totalAmount, discount, paidAmount]);

  const statusBadge = useMemo(() => {
    switch (status) {
      case "Delivered":
        return "border-[#cfe2ff] bg-[#eef5ff] text-[#0066ff]";
      case "Shipped":
        return "border-[#cfe2ff] bg-[#eef5ff] text-[#0066ff]";
      case "Packaging":
        return "border-[#cfe2ff] bg-[#eef5ff] text-[#0066ff]";
      case "Processing":
        return "border-[#cfe2ff] bg-[#eef5ff] text-[#0066ff]";
      case "Pending Approval":
        return "border-[#cfe2ff] bg-[#eef5ff] text-[#0066ff]";
      case "Confirmed":
        return "border-[#cfe2ff] bg-[#eef5ff] text-[#0066ff]";
      case "Cancelled":
        return "border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  }, [status]);

  const approvalBadge = useMemo(() => {
    switch (approvalStatus) {
      case "Approved":
        return "border-[#cfe2ff] bg-[#eef5ff] text-[#0066ff]";
      case "Rejected":
        return "border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border-[#cfe2ff] bg-[#eef5ff] text-[#0066ff]";
    }
  }, [approvalStatus]);

  const paymentBadge = useMemo(() => {
    switch (order.paymentStatus) {
      case "Paid":
        return "border-[#cfe2ff] bg-[#eef5ff] text-[#0066ff]";
      case "Partial":
        return "border-[#cfe2ff] bg-[#eef5ff] text-[#0066ff]";
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  }, [order.paymentStatus]);

  const normalizePhoneForWhatsApp = (phone: string) => {
    let digits = (phone || "").replace(/\D/g, "");

    if (digits.length === 10) {
      digits = `91${digits}`;
    }

    if (digits.startsWith("0") && digits.length > 10) {
      digits = digits.replace(/^0+/, "");
    }

    return digits;
  };

  const buildWhatsAppMessage = () => {
    return `Hello ${order.name},

Regarding your order:

Order ID: ${order.orderId}
Order Type: ${isBulkOrder ? "Bulk Order" : "Standard Order"}
Product: ${order.product}
Quantity: ${order.boxes}

We would like to discuss pricing, confirmation, and delivery.

Thank you,
Lave Mineral Water Team`;
  };

  const openWhatsApp = () => {
    const phone = normalizePhoneForWhatsApp(order.phone);

    if (!phone) {
      alert("Customer phone number not available.");
      return;
    }

    const message = encodeURIComponent(buildWhatsAppMessage());
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, "_blank");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateOrder(order.orderId, {
        approvalStatus,
        status,
        totalAmount: Number(totalAmount || 0),
        discount: Number(discount || 0),
        paidAmount: Number(paidAmount || 0),
        notes,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22 }}
      className={`group relative overflow-hidden rounded-[30px] border bg-white/72 backdrop-blur-2xl shadow-[0_22px_48px_rgba(15,23,42,0.08)] transition-all ${
        isBulkOrder
          ? "border-[#d7e8ff] hover:shadow-[0_30px_60px_rgba(0,102,255,0.18)]"
          : "border-white/75 hover:shadow-[0_30px_60px_rgba(0,102,255,0.14)]"
      }`}
    >
      <div
        className={`absolute inset-0 pointer-events-none ${
          isBulkOrder
            ? "bg-[radial-gradient(circle_at_top_right,rgba(0,102,255,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(0,102,255,0.08),transparent_24%)]"
            : "bg-[radial-gradient(circle_at_top_right,rgba(0,102,255,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(0,102,255,0.05),transparent_24%)]"
        }`}
      />

      <div className="relative z-10 p-4 sm:p-5 space-y-5">
        {isBulkOrder && (
          <div className="flex justify-start">
            <BulkBadge />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 break-all">
                Order #{order.orderId}
              </h2>

              <Badge className={statusBadge}>{status}</Badge>
              <Badge className={approvalBadge}>{approvalStatus}</Badge>
              <Badge className={paymentBadge}>{order.paymentStatus}</Badge>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.08, rotate: -6 }}
                transition={{ duration: 0.2 }}
                className={`flex h-13 w-13 items-center justify-center rounded-[20px] text-[#0066ff] border shadow-[0_12px_24px_rgba(0,102,255,0.10)] ${
                  isBulkOrder
                    ? "bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] border-[#bfdcff]"
                    : "bg-gradient-to-br from-[#eef5ff] to-[#dcecff] border-[#d7e8ff]"
                }`}
              >
                {isBulkOrder ? <FaBuilding /> : <FaUser />}
              </motion.div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900 truncate">
                    {order.name}
                  </p>

                  {isBulkOrder && (
                    <span className="inline-flex items-center rounded-full bg-[#eef5ff] border border-[#cfe2ff] px-2.5 py-1 text-[11px] font-semibold text-[#0066ff]">
                      Priority
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <FaPhone className="text-[#0066ff]" />
                  <span>{order.phone}</span>
                </p>

                {(order.companyName || order.packaging) && (
                  <p className="mt-1 text-xs text-slate-500 truncate">
                    {order.companyName ? order.companyName : order.packaging}
                  </p>
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setExpanded((prev) => !prev)}
            className="shrink-0 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition-all"
          >
            {expanded ? "Less" : "More"}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-[#0066ff]"
            >
              <FaChevronDown />
            </motion.span>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MiniInfo
            icon={<FaBoxOpen />}
            label="Product"
            value={`${order.product} • ${order.size}`}
          />
          <MiniInfo
            icon={<FaClipboardCheck />}
            label="Quantity"
            value={`${order.boxes} Boxes`}
            highlight={isBulkOrder}
          />
          <MiniInfo
            icon={<FaWallet />}
            label="Total"
            value={`₹${Number(order.totalAmount || 0).toLocaleString("en-IN")}`}
          />
          <MiniInfo
            icon={<FaClock />}
            label="Date"
            value={
              order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "-"
            }
          />
        </div>

        {isBulkOrder && (
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-[22px] border border-[#d7e8ff] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbff_100%)] px-4 py-3 shadow-[0_10px_24px_rgba(0,102,255,0.06)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eef5ff] to-[#dcecff] text-[#0066ff] border border-[#d7e8ff] shadow-[0_10px_24px_rgba(0,102,255,0.08)] shrink-0">
                <FaLayerGroup />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0066ff]">
                  Bulk order identified
                </p>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  This order is being highlighted as a bulk request in admin view.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={openWhatsApp}
            className="group/wa flex items-center justify-center gap-2 rounded-[20px] border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-100 hover:shadow-[0_14px_28px_rgba(34,197,94,0.14)] transition-all"
          >
            <motion.span whileHover={{ rotate: -8, scale: 1.06 }}>
              <FaWhatsapp />
            </motion.span>
            WhatsApp
          </motion.button>

          <motion.button
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="group/save flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#0058df] via-[#0066ff] to-[#2f8cff] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,102,255,0.20)] hover:shadow-[0_18px_38px_rgba(0,102,255,0.28)] transition-all disabled:opacity-60"
          >
            {saving ? "Saving..." : "Quick Save"}
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 overflow-hidden"
            >
              <GlassSection title="Customer & Address" icon={<FaMapMarkerAlt />}>
                <div className="grid gap-3">
                  <DetailRow label="Customer" value={order.name} />
                  <DetailRow label="Phone" value={order.phone} />
                  <DetailRow
                    label="Address"
                    value={`${order.address}${order.city ? `, ${order.city}` : ""}${
                      order.state ? `, ${order.state}` : ""
                    }${order.pincode ? ` - ${order.pincode}` : ""}`}
                  />
                </div>
              </GlassSection>

              {isBulkOrder && (
                <GlassSection title="Bulk Order Details" icon={<FaLayerGroup />}>
                  <div className="grid gap-3">
                    <DetailRow
                      label="Order Type"
                      value={isBulkOrder ? "Bulk Order" : "Standard Order"}
                    />
                    <DetailRow
                      label="Company"
                      value={order.companyName || "-"}
                    />
                    <DetailRow
                      label="Packaging"
                      value={order.packaging || "-"}
                    />
                  </div>
                </GlassSection>
              )}

              <GlassSection title="Approval Control" icon={<FaCheckCircle />}>
                <select
                  value={approvalStatus}
                  onChange={(e) => {
                    const nextApproval = e.target.value as Order["approvalStatus"];
                    setApprovalStatus(nextApproval);

                    if (
                      nextApproval === "Approved" &&
                      status === "Pending Approval"
                    ) {
                      setStatus("Confirmed");
                    }
                    if (nextApproval === "Rejected") {
                      setStatus("Cancelled");
                    }
                    if (nextApproval === "Pending") {
                      setStatus("Pending Approval");
                    }
                  }}
                  className="admin-mobile-input"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </GlassSection>

              <GlassSection title="Fulfilment Workflow" icon={<FaTruck />}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Order["status"])}
                  className="admin-mobile-input"
                >
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </GlassSection>

              <GlassSection title="Payment Controls" icon={<FaWallet />}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PaymentInput
                    label="Total Amount"
                    value={totalAmount}
                    onChange={setTotalAmount}
                  />
                  <PaymentInput
                    label="Discount"
                    value={discount}
                    onChange={setDiscount}
                  />
                  <PaymentInput
                    label="Paid Amount"
                    value={paidAmount}
                    onChange={setPaidAmount}
                  />
                </div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="mt-4 rounded-2xl border border-[#d7e8ff] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbff_100%)] px-4 py-3 shadow-[0_10px_24px_rgba(0,102,255,0.06)]"
                >
                  <p className="text-sm text-slate-500">Remaining Amount</p>
                  <p className="mt-1 text-xl font-bold text-[#0066ff]">
                    ₹{liveRemaining.toLocaleString("en-IN")}
                  </p>
                </motion.div>
              </GlassSection>

              <GlassSection title="Admin Notes" icon={<FaFileAlt />}>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="admin-mobile-input resize-none"
                  placeholder="Internal note, approval message, delivery instruction..."
                />
              </GlassSection>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openWhatsApp}
                  className="flex items-center justify-center gap-2 rounded-[20px] border border-green-200 bg-green-50 px-5 py-4 text-base font-semibold text-green-700 hover:bg-green-100 hover:shadow-[0_14px_28px_rgba(34,197,94,0.14)] transition-all"
                >
                  <FaWhatsapp />
                  Contact on WhatsApp
                </motion.button>

                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full rounded-[20px] bg-gradient-to-r from-[#0058df] via-[#0066ff] to-[#2f8cff] px-5 py-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(0,102,255,0.20)] hover:shadow-[0_18px_38px_rgba(0,102,255,0.28)] transition-all disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Updates"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .admin-mobile-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid #dbe7f6;
          background: rgba(255, 255, 255, 0.94);
          color: #1e293b;
          padding: 0.95rem 1rem;
          outline: none;
          transition: 0.25s ease;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.03);
        }
        .admin-mobile-input:hover {
          border-color: rgba(0, 102, 255, 0.22);
          box-shadow: 0 14px 28px rgba(0, 102, 255, 0.08);
        }
        .admin-mobile-input:focus {
          border-color: rgba(0, 102, 255, 0.45);
          box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.12);
        }
      `}</style>
    </motion.div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm ${className}`}
    >
      {children}
    </span>
  );
}

function GlassSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-[24px] border border-white/70 bg-white/72 backdrop-blur-xl p-4 shadow-[0_12px_28px_rgba(33,72,140,0.06)] hover:shadow-[0_18px_36px_rgba(0,102,255,0.10)] transition-all"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eef5ff] to-[#dcecff] text-[#0066ff] border border-[#d7e8ff] shadow-[0_10px_24px_rgba(0,102,255,0.08)]">
          {icon}
        </div>
        <p className="font-semibold text-slate-800">{title}</p>
      </div>
      {children}
    </motion.div>
  );
}

function MiniInfo({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-[20px] border backdrop-blur-xl p-4 transition-all ${
        highlight
          ? "border-[#d7e8ff] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbff_100%)] shadow-[0_12px_26px_rgba(0,102,255,0.08)] hover:shadow-[0_16px_30px_rgba(0,102,255,0.12)]"
          : "border-white/70 bg-white/72 shadow-[0_10px_24px_rgba(33,72,140,0.05)] hover:shadow-[0_16px_30px_rgba(0,102,255,0.10)]"
      }`}
    >
      <div className="mb-2 text-[#0066ff]">{icon}</div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800 leading-relaxed break-words">
        {value}
      </p>
    </motion.div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm text-slate-800 break-words">{value}</p>
    </div>
  );
}

function PaymentInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_14px_28px_rgba(0,102,255,0.08)] transition-all"
    >
      <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <FaRupeeSign className="text-[#0066ff]" />
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-slate-800 font-semibold"
        />
      </div>
    </motion.div>
  );
}

function BulkBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#b9d8ff] bg-[linear-gradient(180deg,#eef6ff_0%,#dcecff_100%)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0066ff] shadow-[0_8px_20px_rgba(0,102,255,0.10)]">
      <FaLayerGroup />
      Bulk Order
    </span>
  );
}