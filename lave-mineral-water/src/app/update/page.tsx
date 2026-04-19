"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaHashtag, FaBoxOpen, FaInfoCircle } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

export default function UpdatePage() {
  const searchParams = useSearchParams();

  const [orderId, setOrderId] = useState("");
  const [boxes, setBoxes] = useState(50);
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState<"single" | "bulk-item" | "bulk-parent" | "">("");

  useEffect(() => {
    const queryOrderId = searchParams.get("orderId") || "";
    if (queryOrderId) {
      setOrderId(queryOrderId);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchType = async () => {
      if (!orderId.trim()) return;

      try {
        const res = await fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();
        const trackedOrder = data?.order;

        if (trackedOrder?.type) {
          setOrderType(trackedOrder.type);

          if (trackedOrder?.boxes) {
            setBoxes(Number(trackedOrder.boxes));
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchType();
  }, [orderId]);

  const handleUpdate = async () => {
    if (!orderId.trim()) {
      alert("Please enter Order ID");
      return;
    }

    if (boxes < 1) {
      alert("Minimum 1 box required");
      return;
    }

    try {
      setLoading(true);

      let url = "/api/orders/update";

      if (orderType === "bulk-item") {
        url = "/api/orders/bulk/update";
      }

      if (orderType === "bulk-parent") {
        alert("Bulk parent order quantity update is not supported from this page.");
        return;
      }

      const res = await fetch(url, {
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
        className="w-full max-w-xl relative overflow-hidden bg-white shadow-lg border border-gray-200 rounded-3xl p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/10 to-purple-200/10 blur-3xl opacity-30"></div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="flex justify-center mb-5"
          >
            <FaEdit className="text-indigo-500 text-6xl drop-shadow-md" />
          </motion.div>

          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-2">
            Update Order Request
          </h1>

          <p className="text-center text-gray-500 mb-6 text-sm">
            Modify your order before packaging starts.
          </p>

          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-white shadow-md border border-indigo-100 text-sm text-indigo-600">
            <FaInfoCircle />
            You can only update order before packaging stage.
          </div>

          <div className="flex items-center gap-3 mb-5">
            <FaHashtag className="text-gray-500" />
            <input
              placeholder="Enter Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full p-3 rounded-xl bg-white shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          <div className="mb-4 text-sm text-gray-500">
            Detected Type:{" "}
            <span className="font-semibold text-indigo-600">
              {orderType || "Not checked yet"}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <FaBoxOpen className="text-gray-500" />
            <input
              type="number"
              value={boxes}
              onChange={(e) => setBoxes(Number(e.target.value))}
              placeholder="Boxes"
              className="w-full p-3 rounded-xl bg-white shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

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