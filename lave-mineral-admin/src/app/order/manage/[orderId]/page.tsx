"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaTrash,
  FaBox,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function ManageOrderPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 FETCH ORDER
  const fetchOrder = async () => {
    const res = await fetch("/api/track", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();
    setOrder(data);
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  // 🔥 UPDATE ORDER
  const handleUpdate = async () => {
    setLoading(true);

    const res = await fetch("/api/orders/update", {
      method: "POST",
      body: JSON.stringify({
        orderId,
        updates: {
          address: order.address,
          city: order.city,
        },
      }),
    });

    const data = await res.json();
    alert(data.message);
    setLoading(false);
  };

  // 🔥 CANCEL ORDER
  const handleCancel = async () => {
    const confirmCancel = confirm("Are you sure to cancel?");
    if (!confirmCancel) return;

    const res = await fetch("/api/cancel", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();
    alert(data.message);
    fetchOrder();
  };

  if (!order) return <p className="p-6 text-[#4a5568]">Loading...</p>;

  const locked =
    ["Packaging", "Shipped", "Delivered"].includes(order.status);

  return (
    <main className="min-h-screen p-6 bg-[#e6ecf5]">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto p-6 rounded-2xl
        bg-[#e6ecf5]
        shadow-[10px_10px_25px_#c8d0e0,-10px_-10px_25px_#ffffff]"
      >
        <h1 className="text-2xl font-bold mb-4 text-[#2d3748]">
          Manage Order
        </h1>

        <p className="mb-2 text-[#4a5568]"><strong>ID:</strong> {order.orderId}</p>
        <p className="mb-4 text-[#4a5568]"><strong>Status:</strong> {order.status}</p>

        {/* 🔥 UPDATE FORM */}
        <div className="space-y-3">
          <input
            value={order.address}
            onChange={(e) =>
              setOrder({ ...order, address: e.target.value })
            }
            className="w-full p-3 rounded-xl
            bg-[#e6ecf5]
            shadow-[inset_4px_4px_8px_#c8d0e0,inset_-4px_-4px_8px_#ffffff]
            focus:outline-none focus:ring-2 focus:ring-[#4c6ef5]"
          />

          <input
            value={order.city}
            onChange={(e) =>
              setOrder({ ...order, city: e.target.value })
            }
            className="w-full p-3 rounded-xl
            bg-[#e6ecf5]
            shadow-[inset_4px_4px_8px_#c8d0e0,inset_-4px_-4px_8px_#ffffff]
            focus:outline-none focus:ring-2 focus:ring-[#4c6ef5]"
          />
        </div>

        {/* 🔥 BUTTONS */}
        <div className="flex gap-4 mt-6">

          {/* UPDATE */}
          <button
            onClick={handleUpdate}
            disabled={locked || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white
            transition-all
            ${
              locked
                ? "bg-gray-400"
                : "bg-[#4c6ef5] hover:bg-[#3b5bdb] shadow-[6px_6px_15px_#c8d0e0,-6px_-6px_15px_#ffffff]"
            }`}
          >
            <FaEdit />
            Update
          </button>

          {/* CANCEL */}
          <button
            onClick={handleCancel}
            disabled={locked}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white
            transition-all
            ${
              locked
                ? "bg-gray-400"
                : "bg-[#868e96] hover:bg-[#495057] shadow-[6px_6px_15px_#c8d0e0,-6px_-6px_15px_#ffffff]"
            }`}
          >
            <FaTrash />
            Cancel Order
          </button>
        </div>

        {locked && (
          <p className="text-[#d6336c] mt-4 text-sm">
            Order locked after packaging 🚫
          </p>
        )}
      </motion.div>
    </main>
  );
}