"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaTrash,
  FaInfoCircle,
  FaArrowLeft,
} from "react-icons/fa";

export default function ManageOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      setPageLoading(true);

      const res = await fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      setOrder(data?.order || null);
    } catch (error) {
      console.error(error);
      setOrder(null);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const orderType = order?.type || "single";

  const locked = useMemo(() => {
    const currentStatus = String(order?.status || "");
    return ["Packaging", "Shipped", "Delivered", "Cancelled"].includes(
      currentStatus
    );
  }, [order?.status]);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const payload =
        orderType === "single"
          ? {
              orderId,
              updates: {
                address: order.address,
                city: order.city,
              },
            }
          : {
              orderId,
              updates: {
                name: order.name,
                phone: order.phone,
                address: order.address,
                city: order.city,
                state: order.state,
                pincode: order.pincode,
              },
            };

      const url =
        orderType === "single"
          ? "/api/orders/update"
          : "/api/orders/bulk/update";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(data.message || data.error);

      if (res.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const confirmCancel = confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      alert(data.message || data.error);

      if (res.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  if (pageLoading) {
    return <p className="p-6 text-[#4a5568]">Loading...</p>;
  }

  if (!order) {
    return (
      <main className="min-h-screen p-6 bg-[#e6ecf5]">
        <div className="max-w-3xl mx-auto rounded-2xl bg-white p-6 shadow">
          <p className="text-red-500 font-medium">Order not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#4c6ef5] px-4 py-2 text-white"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-[#e6ecf5]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto p-6 rounded-2xl
        bg-[#e6ecf5]
        shadow-[10px_10px_25px_#c8d0e0,-10px_-10px_25px_#ffffff]"
      >
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h1 className="text-2xl font-bold text-[#2d3748]">
            Manage Order
          </h1>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-[#4c6ef5]">
            {orderType === "single"
              ? "Single Order"
              : orderType === "bulk-parent"
              ? "Bulk Parent Order"
              : "Bulk Item"}
          </span>
        </div>

        <p className="mb-2 text-[#4a5568]">
          <strong>ID:</strong> {order.orderId}
        </p>
        {order.parentOrderId && order.parentOrderId !== order.orderId && (
          <p className="mb-2 text-[#4a5568]">
            <strong>Parent ID:</strong> {order.parentOrderId}
          </p>
        )}
        <p className="mb-4 text-[#4a5568]">
          <strong>Status:</strong> {order.status}
        </p>

        {orderType === "bulk-item" && (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 flex items-start gap-2">
            <FaInfoCircle className="mt-0.5" />
            This is an item inside a bulk order. Address changes are managed on
            the parent bulk order. Item quantity can be updated from the Update page.
          </div>
        )}

        {(orderType === "single" || orderType === "bulk-parent") && (
          <div className="space-y-3">
            <input
              value={order.address || ""}
              onChange={(e) =>
                setOrder({ ...order, address: e.target.value })
              }
              placeholder="Address"
              className="w-full p-3 rounded-xl
              bg-[#e6ecf5]
              shadow-[inset_4px_4px_8px_#c8d0e0,inset_-4px_-4px_8px_#ffffff]
              focus:outline-none focus:ring-2 focus:ring-[#4c6ef5]"
            />

            <input
              value={order.city || ""}
              onChange={(e) =>
                setOrder({ ...order, city: e.target.value })
              }
              placeholder="City"
              className="w-full p-3 rounded-xl
              bg-[#e6ecf5]
              shadow-[inset_4px_4px_8px_#c8d0e0,inset_-4px_-4px_8px_#ffffff]
              focus:outline-none focus:ring-2 focus:ring-[#4c6ef5]"
            />

            {orderType === "bulk-parent" && (
              <>
                <input
                  value={order.state || ""}
                  onChange={(e) =>
                    setOrder({ ...order, state: e.target.value })
                  }
                  placeholder="State"
                  className="w-full p-3 rounded-xl
                  bg-[#e6ecf5]
                  shadow-[inset_4px_4px_8px_#c8d0e0,inset_-4px_-4px_8px_#ffffff]
                  focus:outline-none focus:ring-2 focus:ring-[#4c6ef5]"
                />

                <input
                  value={order.pincode || ""}
                  onChange={(e) =>
                    setOrder({ ...order, pincode: e.target.value })
                  }
                  placeholder="Pincode"
                  className="w-full p-3 rounded-xl
                  bg-[#e6ecf5]
                  shadow-[inset_4px_4px_8px_#c8d0e0,inset_-4px_-4px_8px_#ffffff]
                  focus:outline-none focus:ring-2 focus:ring-[#4c6ef5]"
                />
              </>
            )}
          </div>
        )}

        <div className="flex gap-4 mt-6 flex-wrap">
          {(orderType === "single" || orderType === "bulk-parent") && (
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
              {loading ? "Updating..." : "Update"}
            </button>
          )}

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