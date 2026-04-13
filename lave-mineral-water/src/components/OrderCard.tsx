"use client";

import { motion } from "framer-motion";
import {
  FaBoxOpen,
  FaLayerGroup,
  FaCheckCircle,
  FaClock,
  FaRupeeSign,
} from "react-icons/fa";

export default function OrderCard({ order }: any) {
  const statusColor = () => {
    switch (order.status) {
      case "Delivered":
        return "bg-green-100 text-green-600";
      case "Processing":
        return "bg-yellow-100 text-yellow-600";
      case "Pending Approval":
        return "bg-gray-200 text-gray-600";
      case "Cancelled":
        return "bg-red-100 text-red-500";
      default:
        return "bg-blue-100 text-[#0066FF]";
    }
  };

  const paymentColor = () => {
    switch (order.paymentStatus) {
      case "Paid":
        return "text-green-600";
      case "Partial":
        return "text-yellow-600";
      default:
        return "text-red-500";
    }
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        boxShadow: "0 15px 40px rgba(0,102,255,0.25)",
      }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/50 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* 🔥 TOP STRIP */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0066FF] to-blue-400" />

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-start sm:items-center mb-4 flex-wrap gap-3">
        <div className="break-all">
          <p className="text-[11px] sm:text-xs text-gray-500">
            Order ID
          </p>
          <h2 className="text-sm sm:text-lg font-bold text-[#0066FF] tracking-wide">
            {order.orderId}
          </h2>
        </div>

        {/* STATUS */}
        <span
          className={`px-3 py-1 text-[10px] sm:text-xs rounded-full font-semibold whitespace-nowrap ${statusColor()}`}
        >
          {order.status}
        </span>
      </div>

      {/* 🔥 BODY */}
      <div className="space-y-3 text-xs sm:text-sm">

        <div className="flex items-center gap-2 text-gray-700">
          <FaBoxOpen className="text-[#0066FF] text-sm" />
          <span>
            <strong>Product:</strong> {order.product}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <FaLayerGroup className="text-[#0066FF] text-sm" />
          <span>
            <strong>Boxes:</strong> {order.boxes}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <FaRupeeSign className="text-[#0066FF] text-sm" />
          <span>
            <strong>Payment:</strong>{" "}
            <span className={`font-semibold ${paymentColor()}`}>
              {order.paymentStatus}
            </span>
          </span>
        </div>

      </div>

      {/* 🔥 FOOTER */}
      <div className="mt-5 pt-4 border-t border-gray-200 flex justify-between items-center text-[10px] sm:text-xs text-gray-500">

        <div className="flex items-center gap-1">
          {order.status === "Delivered" ? (
            <>
              <FaCheckCircle className="text-green-500 text-xs" />
              Completed
            </>
          ) : (
            <>
              <FaClock className="text-[#0066FF] text-xs" />
              In Progress
            </>
          )}
        </div>

        <span className="whitespace-nowrap">
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : "N/A"}
        </span>
      </div>
    </motion.div>
  );
}