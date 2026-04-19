"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaTimesCircle,
  FaHashtag,
  FaExclamationTriangle,
} from "react-icons/fa";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryOrderId = searchParams.get("orderId") || "";
    if (queryOrderId) {
      setOrderId(queryOrderId);
    }
  }, [searchParams]);

  const handleCancel = async () => {
    if (!orderId.trim()) {
      alert("Please enter Order ID");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      alert(data.message || data.error);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl relative overflow-hidden rounded-3xl p-8 bg-white border border-gray-200 shadow-lg"
      >
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="flex justify-center mb-5"
          >
            <FaTimesCircle className="text-[#4c6ef5] text-6xl" />
          </motion.div>

          <h1 className="text-3xl font-semibold text-center text-[#2d3748] mb-2">
            Cancel Order Request
          </h1>

          <p className="text-center text-[#718096] mb-6 text-sm">
            You can cancel your order only before packaging starts.
          </p>

          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl text-sm text-[#d6336c] bg-white border border-red-100 shadow-md">
            <FaExclamationTriangle />
            Once packaging starts, cancellation is not allowed.
          </div>

          <div className="flex items-center gap-3 mb-5">
            <FaHashtag className="text-[#718096]" />
            <input
              placeholder="Enter Order ID (e.g. LAVE-XXXX)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#4c6ef5] transition"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            disabled={loading}
            onClick={handleCancel}
            className={`w-full py-3 rounded-xl text-white font-semibold tracking-wide bg-[#4c6ef5] hover:bg-[#3b5bdb] transition-all shadow-md ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Processing..." : "❌ Cancel Order"}
          </motion.button>

          <Link
            href="/"
            className="block w-full mt-4 py-3 rounded-xl text-center font-medium text-[#4c6ef5] bg-white border border-blue-100 shadow-md hover:scale-[1.02] transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}