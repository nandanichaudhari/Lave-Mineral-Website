"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusTracker from "@/components/StatusTracker";
import {
  FaSearch,
  FaBox,
  FaRupeeSign,
  FaCheckCircle,
  FaLayerGroup,
  FaTruck,
  FaTimesCircle,
} from "react-icons/fa";

type TrackOrderType = "single" | "bulk-parent" | "bulk-item";

interface BulkTrackItem {
  product: string;
  size?: string;
  boxes?: number;
  itemTrackingId: string;
  status: string;
  approvalStatus?: string;
  paymentStatus?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
}

interface TrackedOrder {
  type?: TrackOrderType;
  orderId: string;
  parentOrderId?: string;
  status: string;
  approvalStatus?: string;
  paymentStatus?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  product?: string;
  size?: string;
  boxes?: number;
  totalProducts?: number;
  totalBoxes?: number;
  name?: string;
  items?: BulkTrackItem[];
}

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [trackedOrderId, setTrackedOrderId] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const fetchTrackData = useCallback(
    async (targetOrderId: string, options?: { silent?: boolean }) => {
      const trimmedOrderId = targetOrderId.trim();

      if (!trimmedOrderId) {
        setError("Please enter an order ID.");
        setOrder(null);
        return;
      }

      const silent = options?.silent ?? false;

      if (!silent) {
        setError("");
      }

      try {
        const res = await fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId: trimmedOrderId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || data?.message || "Order not found");
        }

        if (!data?.order) {
          throw new Error("No tracking data found");
        }

        setOrder((prev) => {
          const prevSerialized = JSON.stringify(prev);
          const nextSerialized = JSON.stringify(data.order);
          return prevSerialized === nextSerialized ? prev : data.order;
        });

        setTrackedOrderId(trimmedOrderId);
        setError("");
      } catch (error: any) {
        console.error(error);

        if (!silent) {
          setOrder(null);
          setTrackedOrderId("");
          setError(error?.message || "Unable to track this order");
        }
      }
    },
    []
  );

  const handleTrack = useCallback(async () => {
    const trimmedOrderId = orderId.trim();

    if (!trimmedOrderId) {
      setError("Please enter an order ID.");
      setOrder(null);
      setTrackedOrderId("");
      return;
    }

    setHasSearched(true);
    await fetchTrackData(trimmedOrderId, { silent: false });
  }, [orderId, fetchTrackData]);

  useEffect(() => {
    if (!trackedOrderId || !order) return;

    const interval = setInterval(() => {
      fetchTrackData(trackedOrderId, { silent: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [trackedOrderId, order, fetchTrackData]);

  const orderType: TrackOrderType = order?.type || "single";

  const statusBadgeClass = (status: string) => {
    switch (String(status || "").toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-rose-100 text-rose-700";
      case "pending approval":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
      case "packaging":
      case "confirmed":
      case "partially shipped":
      case "shipped":
      case "partially delivered":
        return "bg-blue-100 text-[#0066FF]";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f0f6ff] via-white to-[#e6f0ff] px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-light uppercase tracking-widest text-[#0066FF] md:text-5xl">
          Track Your Order
        </h1>

        <p className="mt-3 tracking-wide text-gray-500">
          Real-time tracking • Live updates • Secure system
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto flex max-w-xl items-center gap-3 rounded-3xl border border-white/50 bg-white/40 p-6 shadow-xl backdrop-blur-xl"
      >
        <FaSearch className="text-xl text-[#0066FF]" />

        <input
          placeholder="Enter Order ID / Main Bulk ID / Item Tracking ID"
          className="flex-1 bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleTrack();
            }
          }}
        />

        <button
          onClick={handleTrack}
          className="rounded-xl bg-gradient-to-r from-[#0066FF] to-blue-500 px-5 py-2 font-medium text-white shadow-lg transition hover:scale-105"
        >
          Track
        </button>
      </motion.div>

      <AnimatePresence>
        {!!error && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-8 max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <FaTimesCircle className="shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!order && !error && hasSearched && (
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white/70 px-5 py-6 text-center text-slate-500 shadow-sm backdrop-blur">
          No tracking details found.
        </div>
      )}

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-12 max-w-5xl rounded-3xl border border-white/50 bg-white/40 p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">
                {orderType === "bulk-item"
                  ? "Item Tracking ID"
                  : orderType === "bulk-parent"
                  ? "Main Bulk Order ID"
                  : "Order ID"}
              </p>

              <h2 className="break-all text-xl font-bold text-[#0066FF]">
                {order.orderId}
              </h2>

              {order.parentOrderId && order.parentOrderId !== order.orderId && (
                <p className="mt-2 text-sm text-gray-600">
                  Main Order ID:{" "}
                  <span className="font-semibold text-slate-800">
                    {order.parentOrderId}
                  </span>
                </p>
              )}
            </div>

            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-2 ${statusBadgeClass(
                order.status
              )}`}
            >
              <FaCheckCircle />
              <span className="text-sm font-medium">{order.status}</span>
            </div>
          </div>

          <StatusTracker status={order.status} />

          <hr className="my-8 border-white/40" />

          {orderType === "single" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/50 bg-white/60 p-6 shadow-md backdrop-blur-lg">
                <div className="mb-4 flex items-center gap-2">
                  <FaRupeeSign className="text-[#0066FF]" />
                  <h3 className="font-semibold text-gray-800">Payment Details</h3>
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
                  Payment Status:{" "}
                  <span className="font-semibold text-green-600">
                    {order.paymentStatus || "Pending"}
                  </span>
                </p>

                <p className="mt-2 text-sm">
                  Approval:{" "}
                  <span className="font-semibold text-[#0066FF]">
                    {order.approvalStatus || "Pending"}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-white/50 bg-white/60 p-6 shadow-md backdrop-blur-lg">
                <div className="mb-4 flex items-center gap-2">
                  <FaBox className="text-[#0066FF]" />
                  <h3 className="font-semibold text-gray-800">Order Summary</h3>
                </div>

                <p className="text-sm text-gray-600">
                  Product: <strong>{order.product || "-"}</strong>
                </p>

                <p className="text-sm text-gray-600">
                  Boxes: <strong>{order.boxes || 0}</strong>
                </p>

                {order.size && (
                  <p className="text-sm text-gray-600">
                    Size: <strong>{order.size}</strong>
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  Delivery Status: <strong>{order.status}</strong>
                </p>
              </div>
            </div>
          )}

          {orderType === "bulk-parent" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/50 bg-white/60 p-6 shadow-md backdrop-blur-lg">
                  <div className="mb-4 flex items-center gap-2">
                    <FaLayerGroup className="text-[#0066FF]" />
                    <h3 className="font-semibold text-gray-800">
                      Bulk Order Summary
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600">
                    Total Products: <strong>{order.totalProducts || 0}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Boxes: <strong>{order.totalBoxes || 0}</strong>
                  </p>
                  <p className="mt-2 text-sm">
                    Approval:{" "}
                    <span className="font-semibold text-[#0066FF]">
                      {order.approvalStatus || "Pending"}
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl border border-white/50 bg-white/60 p-6 shadow-md backdrop-blur-lg">
                  <div className="mb-4 flex items-center gap-2">
                    <FaTruck className="text-[#0066FF]" />
                    <h3 className="font-semibold text-gray-800">Bulk Status</h3>
                  </div>

                  <p className="text-sm text-gray-600">
                    Main Status: <strong>{order.status}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Customer: <strong>{order.name || "-"}</strong>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/50 bg-white/60 p-6 shadow-md backdrop-blur-lg">
                <h3 className="mb-4 font-semibold text-gray-800">
                  Item Tracking List
                </h3>

                <div className="space-y-3">
                  {order.items?.length ? (
                    order.items.map((item, index) => (
                      <div
                        key={`${item.itemTrackingId}-${index}`}
                        className="rounded-2xl border border-white/60 bg-white/70 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.product}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.size || "-"} • {item.boxes || 0} Boxes
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[#0066FF]">
                              {item.itemTrackingId}
                            </p>
                          </div>

                          <div
                            className={`rounded-xl px-3 py-2 text-sm font-semibold ${statusBadgeClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No bulk item tracking data available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {orderType === "bulk-item" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/50 bg-white/60 p-6 shadow-md backdrop-blur-lg">
                <div className="mb-4 flex items-center gap-2">
                  <FaBox className="text-[#0066FF]" />
                  <h3 className="font-semibold text-gray-800">Item Summary</h3>
                </div>

                <p className="text-sm text-gray-600">
                  Product: <strong>{order.product || "-"}</strong>
                </p>

                <p className="text-sm text-gray-600">
                  Size: <strong>{order.size || "-"}</strong>
                </p>

                <p className="text-sm text-gray-600">
                  Boxes: <strong>{order.boxes || 0}</strong>
                </p>

                <p className="mt-2 text-sm">
                  Approval:{" "}
                  <span className="font-semibold text-[#0066FF]">
                    {order.approvalStatus || "Pending"}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-white/50 bg-white/60 p-6 shadow-md backdrop-blur-lg">
                <div className="mb-4 flex items-center gap-2">
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
                  Payment Status:{" "}
                  <span className="font-semibold text-green-600">
                    {order.paymentStatus || "Pending"}
                  </span>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </main>
  );
}