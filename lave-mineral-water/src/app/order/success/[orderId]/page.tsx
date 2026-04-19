"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaBox,
  FaTruck,
  FaClock,
  FaHashtag,
  FaCopy,
} from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";

export default function SuccessPage() {
  const params = useParams();
  const orderId =
    typeof params?.orderId === "string" ? params.orderId : "";

  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    if (!orderId) return;

    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy order ID:", error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 bg-white relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl rounded-3xl p-6 sm:p-10 text-center bg-white border border-gray-200 shadow-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 rounded-full bg-white border border-blue-100 shadow-md">
            <FaCheckCircle className="text-[#4c6ef5] text-5xl sm:text-6xl" />
          </div>
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#2d3748] mb-2">
          Order Placed Successfully 🎉
        </h1>

        <p className="text-[#718096] text-sm sm:text-base mb-6">
          Your order request has been received.
          We’ll process it shortly and keep you updated.
        </p>

        <div className="rounded-2xl p-5 text-left bg-white border border-gray-200 shadow-md">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <p className="text-sm sm:text-base flex items-center gap-2 text-[#4a5568]">
              <FaHashtag className="text-[#4c6ef5]" />
              <strong>Order ID:</strong>
              <span className="text-[#4c6ef5] font-bold break-all">
                {orderId || "Not available"}
              </span>
            </p>

            <button
              onClick={copyId}
              disabled={!orderId}
              type="button"
              className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-white text-[#4c6ef5] border border-blue-100 shadow-sm hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCopy />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="space-y-3 text-sm text-[#4a5568]">
            <p className="flex items-center gap-2">
              <FaClock className="text-[#fab005]" />
              Awaiting Admin Approval
            </p>

            <p className="flex items-center gap-2">
              <FaBox className="text-[#4c6ef5]" />
              Processing starts after approval
            </p>

            <p className="flex items-center gap-2">
              <FaTruck className="text-[#748ffc]" />
              Delivery schedule will be shared
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/track"
            className="py-3 rounded-xl text-sm font-medium text-white bg-[#4c6ef5] hover:bg-[#3b5bdb] shadow-md hover:scale-[1.03] transition-all text-center"
          >
            📦 Track
          </Link>

          <Link
            href={`/update?orderId=${encodeURIComponent(orderId)}`}
            className="py-3 rounded-xl text-sm font-medium bg-white text-[#4c6ef5] border border-blue-100 shadow-md hover:scale-[1.03] transition-all text-center"
          >
            ✏️ Update
          </Link>

          <Link
            href={`/cancel?orderId=${encodeURIComponent(orderId)}`}
            className="py-3 rounded-xl text-sm font-medium bg-white text-[#868e96] border border-gray-200 shadow-md hover:scale-[1.03] transition-all text-center"
          >
            ❌ Cancel
          </Link>
        </div>

        <Link
          href="/orderHistory"
          className="block mt-6 text-xs text-[#718096] hover:text-[#4c6ef5] transition"
        >
          Go to Dashboard →
        </Link>
      </motion.div>
    </main>
  );
}