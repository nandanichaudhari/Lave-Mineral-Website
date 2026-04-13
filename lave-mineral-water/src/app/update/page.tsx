"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaHashtag, FaBoxOpen, FaInfoCircle } from "react-icons/fa";

export default function UpdatePage() {
  const [orderId, setOrderId] = useState("");
  const [boxes, setBoxes] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!orderId) {
      alert("Please enter Order ID");
      return;
    }

    if (boxes < 50) {
      alert("Minimum 50 boxes required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/orders/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          updates: { boxes },
        }),
      });

      const data = await res.json();
      alert(data.message || data.error);
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-white">
      
      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl relative overflow-hidden bg-white shadow-lg border border-gray-200 rounded-3xl p-8"
      >
        
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/10 to-purple-200/10 blur-3xl opacity-30"></div>

        <div className="relative z-10">

          {/* ICON */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="flex justify-center mb-5"
          >
            <FaEdit className="text-indigo-500 text-6xl drop-shadow-md" />
          </motion.div>

          {/* TITLE */}
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-2">
            Update Order Request
          </h1>

          <p className="text-center text-gray-500 mb-6 text-sm">
            Modify your order before packaging starts.
          </p>

          {/* INFO BOX */}
          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-white shadow-md border border-indigo-100 text-sm text-indigo-600">
            <FaInfoCircle />
            You can only update order before packaging stage.
          </div>

          {/* ORDER ID */}
          <div className="flex items-center gap-3 mb-5">
            <FaHashtag className="text-gray-500" />
            <input
              placeholder="Enter Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full p-3 rounded-xl bg-white shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          {/* BOXES */}
          <div className="flex items-center gap-3 mb-6">
            <FaBoxOpen className="text-gray-500" />
            <input
              type="number"
              value={boxes}
              onChange={(e) => setBoxes(Number(e.target.value))}
              placeholder="Boxes (Min 50)"
              className="w-full p-3 rounded-xl bg-white shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          {/* BUTTON */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            disabled={loading}
            onClick={handleUpdate}
            className={`w-full py-3 rounded-xl text-white font-semibold tracking-wide
            bg-gradient-to-r from-indigo-500 to-purple-500
            hover:from-indigo-600 hover:to-purple-600
            shadow-md transition-all
            ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Updating..." : "✏️ Update Order"}
          </motion.button>

        </div>
      </motion.div>
    </main>
  );
}