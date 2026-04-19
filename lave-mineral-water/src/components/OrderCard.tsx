"use client";

import { motion } from "framer-motion";
import {
  FaBoxOpen,
  FaLayerGroup,
  FaCheckCircle,
  FaClock,
  FaRupeeSign,
  FaListUl,
} from "react-icons/fa";

type OrderCardProps = {
  order: any;
  onOpenBulk?: (order: any) => void;
};

export default function OrderCard({ order, onOpenBulk }: OrderCardProps) {
  const isBulk = order?.type === "bulk" || !!order?.parentOrderId;

  const statusColor = () => {
    switch (String(order.status || "").toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-600";
      case "processing":
        return "bg-yellow-100 text-yellow-600";
      case "pending approval":
        return "bg-gray-200 text-gray-600";
      case "cancelled":
        return "bg-red-100 text-red-500";
      case "partially shipped":
      case "shipped":
        return "bg-purple-100 text-purple-600";
      case "confirmed":
        return "bg-blue-100 text-[#0066FF]";
      default:
        return "bg-blue-100 text-[#0066FF]";
    }
  };

  const paymentColor = () => {
    switch (String(order.paymentStatus || "").toLowerCase()) {
      case "paid":
        return "text-green-600";
      case "partial":
        return "text-yellow-600";
      default:
        return "text-red-500";
    }
  };

  const displayOrderId = order.parentOrderId || order.mainOrderId || order.orderId;
  const displayProduct = isBulk ? "Bulk Order" : order.product;
  const displayBoxes = Number(order.boxes || 0);
  const displayProductsCount = Number(order.totalProducts || order.items?.length || 0);

  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        boxShadow: "0 15px 40px rgba(0,102,255,0.25)",
      }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/50 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl sm:rounded-3xl sm:p-6"
    >
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0066FF] to-blue-400" />

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:items-center">
        <div className="break-all">
          <p className="text-[11px] text-gray-500 sm:text-xs">
            {isBulk ? "Main Order ID" : "Order ID"}
          </p>
          <h2 className="text-sm font-bold tracking-wide text-[#0066FF] sm:text-lg">
            {displayOrderId}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isBulk && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-semibold text-[#0066FF] sm:text-xs">
              <FaLayerGroup />
              Bulk Order
            </span>
          )}

          <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold sm:text-xs ${statusColor()}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <FaBoxOpen className="text-sm text-[#0066FF]" />
          <span>
            <strong>{isBulk ? "Order:" : "Product:"}</strong> {displayProduct}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <FaLayerGroup className="text-sm text-[#0066FF]" />
          <span>
            <strong>{isBulk ? "Total Boxes:" : "Boxes:"}</strong> {displayBoxes}
          </span>
        </div>

        {isBulk && (
          <div className="flex items-center gap-2 text-gray-700">
            <FaListUl className="text-sm text-[#0066FF]" />
            <span>
              <strong>Products:</strong> {displayProductsCount}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-700">
          <FaRupeeSign className="text-sm text-[#0066FF]" />
          <span>
            <strong>Payment:</strong>{" "}
            <span className={`font-semibold ${paymentColor()}`}>
              {order.paymentStatus}
            </span>
          </span>
        </div>
      </div>

      <hr className="my-4 border-gray-200" />

      <div className="space-y-2 text-xs sm:text-sm">
        <p className="flex items-center gap-2 text-gray-700">
          <FaRupeeSign className="text-[#0066FF]" />
          ₹{Number(order.totalAmount || 0)}
        </p>

        <p className="flex items-center gap-2 text-green-600">
          <FaCheckCircle />
          ₹{Number(order.paidAmount || 0)}
        </p>

        <p className="text-gray-700">Remaining: ₹{Number(order.remainingAmount || 0)}</p>
        <p className="text-gray-500">Approval: {order.approvalStatus}</p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-[#0066ff] to-[#0052cc] transition-all duration-700"
          style={{
            width:
              String(order.status || "").toLowerCase() === "pending approval"
                ? "12%"
                : String(order.status || "").toLowerCase() === "confirmed"
                ? "25%"
                : String(order.status || "").toLowerCase() === "processing"
                ? "45%"
                : String(order.status || "").toLowerCase() === "packaging"
                ? "65%"
                : String(order.status || "").toLowerCase() === "partially shipped"
                ? "78%"
                : String(order.status || "").toLowerCase() === "shipped"
                ? "85%"
                : String(order.status || "").toLowerCase() === "partially delivered"
                ? "92%"
                : "100%",
          }}
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4 text-[10px] text-gray-500 sm:text-xs">
        <div className="flex items-center gap-1">
          {String(order.status || "").toLowerCase() === "delivered" ? (
            <>
              <FaCheckCircle className="text-xs text-green-500" />
              Completed
            </>
          ) : (
            <>
              <FaClock className="text-xs text-[#0066FF]" />
              In Progress
            </>
          )}
        </div>

        <span className="whitespace-nowrap">
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
        </span>
      </div>

      {isBulk && typeof onOpenBulk === "function" && (
        <button
          onClick={() => onOpenBulk(order)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0066ff]/20 bg-[#0066ff]/5 px-4 py-3 text-sm font-semibold text-[#0066ff] transition hover:bg-[#0066ff]/10"
        >
          <FaListUl />
          View Products & IDs
        </button>
      )}
    </motion.div>
  );
}