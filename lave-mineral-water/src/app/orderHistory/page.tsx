"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBox,
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaSyncAlt,
  FaRegCopy,
  FaEdit,
  FaTimesCircle,
} from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Order {
  orderId: string;
  product: string;
  boxes: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  paymentStatus: string;
  approvalStatus: string;
  createdAt: string;
}

export default function OrderHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/login");
  }, [session, status, router]);

  const normalizeOrders = (incomingOrders: Order[]) => {
    return [...incomingOrders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const fetchOrders = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!session) return;

      const silent = options?.silent ?? false;

      if (!silent) {
        if (orders.length === 0) {
          setInitialLoading(true);
        } else {
          setRefreshing(true);
        }
      }

      try {
        const res = await fetch("/api/orders/user", { cache: "no-store" });
        const data = await res.json();

        const fetchedOrders = Array.isArray(data?.orders) ? data.orders : [];
        const sortedOrders = normalizeOrders(fetchedOrders);

        setOrders((prevOrders) => {
          const prevSerialized = JSON.stringify(prevOrders);
          const nextSerialized = JSON.stringify(sortedOrders);

          if (prevSerialized === nextSerialized) {
            return prevOrders;
          }

          return sortedOrders;
        });
      } catch (err) {
        console.error("Fetch error:", err);
        if (!silent) {
          setOrders([]);
        }
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [session, orders.length]
  );

  useEffect(() => {
    if (!session) return;

    fetchOrders();

    intervalRef.current = setInterval(() => {
      fetchOrders({ silent: true });
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session, fetchOrders]);

  const copyOrderId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 1600);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const getStatusWidth = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending approval":
        return "12%";
      case "confirmed":
        return "25%";
      case "processing":
        return "45%";
      case "packaging":
        return "65%";
      case "shipped":
        return "85%";
      case "delivered":
        return "100%";
      case "cancelled":
        return "100%";
      default:
        return "10%";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending approval":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "packaging":
        return "bg-indigo-100 text-indigo-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleString() : "-";

  const isActionLocked = (status: string) => {
    const s = status.toLowerCase();
    return ["packaging", "shipped", "delivered", "cancelled"].includes(s);
  };

  const isUpdateLocked = (status: string) => {
    const s = status.toLowerCase();
    return ["shipped", "delivered", "cancelled"].includes(s);
  };

  if (status === "loading" || initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-[#0066ff]">
        Loading Order History...
      </div>
    );
  }

  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (o) => o.status.toLowerCase() === "delivered"
  ).length;
  const pendingOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status.toLowerCase())
  ).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e6f0ff] via-white to-[#ccdfff] px-4 py-10 font-sans sm:px-6 md:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-[#0066ff] opacity-20 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#0052cc] opacity-20 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl md:text-4xl">
            📦 Order History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track, update, and manage all your orders in one place
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#0052cc] px-4 py-2 text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            label: "Total Orders",
            count: totalOrders,
            icon: <FaBox className="text-2xl text-[#0066ff]" />,
            color: "from-[#0066ff] to-[#0052cc]",
          },
          {
            label: "Completed",
            count: completedOrders,
            icon: <FaCheckCircle className="text-2xl text-green-500" />,
            color: "from-green-400 to-green-600",
          },
          {
            label: "Active",
            count: pendingOrders,
            icon: <FaClock className="text-2xl text-yellow-500" />,
            color: "from-yellow-400 to-yellow-600",
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 25px rgba(0,102,255,0.18)",
            }}
            className="rounded-2xl border border-white/40 bg-white/60 p-5 text-center shadow-lg backdrop-blur-xl"
          >
            <div className="flex flex-col items-center justify-center">
              {card.icon}
              <h3 className="mt-2 text-lg font-medium text-gray-700">
                {card.label}
              </h3>
              <p
                className={`mt-1 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent ${card.color}`}
              >
                {card.count}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-20 text-center text-gray-500">No orders found</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {orders.map((order, index) => {
              const cancelLocked = isActionLocked(order.status);
              const updateLocked = isUpdateLocked(order.status);

              return (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 25px rgba(0,102,255,0.20)",
                  }}
                  className="group rounded-2xl border border-white/50 bg-white/70 p-5 shadow-lg backdrop-blur-xl transition-all duration-300"
                >
                  <div className="mb-3 flex justify-between gap-3">
                    <h2 className="font-semibold text-gray-800">
                      {order.product}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Order ID
                        </p>
                        <p className="break-all font-medium text-[#0066ff]">
                          {order.orderId}
                        </p>
                      </div>

                      <button
                        onClick={() => copyOrderId(order.orderId)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#0066ff]/20 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0066ff] transition hover:bg-[#0066ff]/5"
                        title="Copy Order ID"
                      >
                        <FaRegCopy className="text-[11px]" />
                        {copiedId === order.orderId ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <p>Boxes: {order.boxes}</p>
                    <p className="text-xs">{formatDate(order.createdAt)}</p>
                  </div>

                  <hr className="my-4 border-white/40" />

                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2 text-gray-700">
                      <FaRupeeSign /> ₹{order.totalAmount}
                    </p>
                    <p className="flex items-center gap-2 text-green-600">
                      <FaCheckCircle /> ₹{order.paidAmount}
                    </p>
                    <p className="text-gray-700">
                      Remaining: ₹{order.remainingAmount}
                    </p>
                    <p className="text-xs text-gray-500">
                      Payment: {order.paymentStatus}
                    </p>
                    <p className="text-xs text-gray-500">
                      Approval: {order.approvalStatus}
                    </p>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-gradient-to-r from-[#0066ff] to-[#0052cc] transition-all duration-700"
                      style={{ width: getStatusWidth(order.status) }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {updateLocked ? (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-400"
                      >
                        <FaEdit />
                        Update
                      </button>
                    ) : (
                      <Link
                        href={`/update?orderId=${encodeURIComponent(
                          order.orderId
                        )}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0066ff]/20 bg-white px-4 py-2.5 text-sm font-medium text-[#0066ff] transition hover:border-[#0066ff]/40 hover:bg-[#0066ff]/5"
                      >
                        <FaEdit />
                        Update
                      </Link>
                    )}

                    {cancelLocked ? (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-300"
                      >
                        <FaTimesCircle />
                        Cancel
                      </button>
                    ) : (
                      <Link
                        href={`/cancel?orderId=${encodeURIComponent(
                          order.orderId
                        )}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700"
                      >
                        <FaTimesCircle />
                        Cancel
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}