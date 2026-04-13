"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import StatusTracker from "@/components/StatusTracker";
import {
  FaSearch,
  FaBox,
  FaRupeeSign,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = useCallback(async () => {
    if (!orderId.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: orderId.trim() }),
      });

      const data = await res.json();
      setOrder(data?.order || null);
    } catch (error) {
      console.error(error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !order) return;

    const interval = setInterval(() => {
      handleTrack();
    }, 4000);

    return () => clearInterval(interval);
  }, [orderId, order, handleTrack]);

  return (
    <main className="min-h-screen px-6 py-16 bg-gradient-to-br from-[#f0f6ff] via-white to-[#e6f0ff]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-light tracking-widest text-[#0066FF] uppercase">
          Track Your Order
        </h1>

        <p className="text-gray-500 mt-3 tracking-wide">
          Real-time tracking • Live updates • Secure system
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto backdrop-blur-xl bg-white/40 border border-white/50 shadow-xl rounded-3xl p-6 flex gap-3 items-center"
      >
        <FaSearch className="text-[#0066FF] text-xl" />

        <input
          placeholder="Enter Order ID"
          className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />

        <button
          onClick={handleTrack}
          className="px-5 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-[#0066FF] to-blue-500 hover:scale-105 transition shadow-lg"
        >
          Track
        </button>
      </motion.div>

      {loading && (
        <div className="flex justify-center mt-6">
          <FaSpinner className="animate-spin text-[#0066FF] text-2xl" />
        </div>
      )}

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mt-12 backdrop-blur-xl bg-white/40 border border-white/50 shadow-2xl rounded-3xl p-8"
        >
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <h2 className="text-xl font-bold text-[#0066FF]">
                {order.orderId}
              </h2>
            </div>

            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-xl">
              <FaCheckCircle className="text-green-600" />
              <span className="text-green-700 font-medium text-sm">
                {order.status}
              </span>
            </div>
          </div>

          <StatusTracker status={order.status} />

          <hr className="my-8 border-white/40" />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-white/50">
              <div className="flex items-center gap-2 mb-4">
                <FaRupeeSign className="text-[#0066FF]" />
                <h3 className="font-semibold text-gray-800">
                  Payment Details
                </h3>
              </div>

              <p className="text-sm text-gray-600">
                Total: <strong>₹{order.totalAmount || 0}</strong>
              </p>

              <p className="text-sm text-gray-600">
                Paid: <strong>₹{order.paidAmount || 0}</strong>
              </p>

              <p className="text-sm text-gray-600">
                Remaining: <strong>₹{order.remainingAmount || 0}</strong>
              </p>

              <p className="mt-2 text-sm">
                Status:{" "}
                <span className="text-green-600 font-semibold">
                  {order.paymentStatus}
                </span>
              </p>

              <p className="mt-2 text-sm">
                Approval:{" "}
                <span className="text-[#0066FF] font-semibold">
                  {order.approvalStatus}
                </span>
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-white/50">
              <div className="flex items-center gap-2 mb-4">
                <FaBox className="text-[#0066FF]" />
                <h3 className="font-semibold text-gray-800">
                  Order Summary
                </h3>
              </div>

              <p className="text-sm text-gray-600">
                Product: <strong>{order.product}</strong>
              </p>

              <p className="text-sm text-gray-600">
                Boxes: <strong>{order.boxes}</strong>
              </p>

              <p className="text-sm text-gray-600">
                Delivery Status: <strong>{order.status}</strong>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}