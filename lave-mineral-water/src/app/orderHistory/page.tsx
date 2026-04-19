"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBox,
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaRegCopy,
  FaLayerGroup,
  FaListUl,
  FaTimes,
} from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

interface RawOrder {
  orderId: string;
  mainOrderId?: string;
  product: string;
  size?: string;
  boxes: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  paymentStatus: string;
  approvalStatus: string;
  createdAt: string;
  bulkOrder?: boolean;
  orderType?: string;
  totalProducts?: number;
  totalBoxes?: number;
}

interface SingleOrder {
  type: "single";
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

interface BulkOrderItem {
  product: string;
  size: string;
  boxes: number;
  itemTrackingId: string;
  status: string;
  approvalStatus: string;
  paymentStatus: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

interface BulkOrderCard {
  type: "bulk";
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
  totalProducts: number;
  items: BulkOrderItem[];
}

type HistoryOrder = SingleOrder | BulkOrderCard;

export default function OrderHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBulkOrder, setSelectedBulkOrder] =
    useState<BulkOrderCard | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/login");
  }, [session, status, router]);

  const isBulkRow = (order: RawOrder) => {
    return Boolean(
      order.bulkOrder ||
        String(order.orderType || "").toLowerCase() === "bulk" ||
        (order.mainOrderId && order.mainOrderId.trim().length > 0)
    );
  };

  const deriveGroupStatus = (statuses: string[]) => {
    const normalized = statuses.map((s) => s.toLowerCase());

    if (normalized.every((s) => s === "cancelled")) return "Cancelled";
    if (normalized.every((s) => s === "delivered")) return "Delivered";
    if (normalized.some((s) => s === "delivered")) return "Partially Delivered";
    if (normalized.every((s) => s === "shipped")) return "Shipped";
    if (normalized.some((s) => s === "shipped")) return "Partially Shipped";
    if (normalized.some((s) => s === "packaging")) return "Packaging";
    if (normalized.some((s) => s === "processing")) return "Processing";
    if (normalized.some((s) => s === "confirmed")) return "Confirmed";
    return "Pending Approval";
  };

  const deriveGroupApproval = (approvals: string[]) => {
    const normalized = approvals.map((a) => a.toLowerCase());
    if (normalized.every((a) => a === "rejected")) return "Rejected";
    if (normalized.every((a) => a === "approved")) return "Approved";
    return "Pending";
  };

  const deriveGroupPayment = (payments: string[]) => {
    const normalized = payments.map((p) => p.toLowerCase());
    if (normalized.every((p) => p === "paid")) return "Paid";
    if (normalized.some((p) => p === "partial" || p === "paid")) return "Partial";
    return "Pending";
  };

  const normalizeOrders = (rawOrders: RawOrder[]) => {
    const singles: HistoryOrder[] = [];
    const bulkGroups = new Map<string, RawOrder[]>();

    for (const order of rawOrders || []) {
      if (isBulkRow(order) && order.mainOrderId) {
        if (!bulkGroups.has(order.mainOrderId)) {
          bulkGroups.set(order.mainOrderId, []);
        }
        bulkGroups.get(order.mainOrderId)!.push(order);
      } else {
        singles.push({
          type: "single",
          orderId: order.orderId,
          product: order.product,
          boxes: Number(order.boxes || 0),
          totalAmount: Number(order.totalAmount || 0),
          paidAmount: Number(order.paidAmount || 0),
          remainingAmount: Number(order.remainingAmount || 0),
          status: order.status,
          paymentStatus: order.paymentStatus,
          approvalStatus: order.approvalStatus,
          createdAt: order.createdAt,
        });
      }
    }

    const bulks: HistoryOrder[] = Array.from(bulkGroups.entries()).map(
      ([mainOrderId, group]) => {
        const sortedGroup = [...group].sort(
          (a, b) =>
            new Date(a.createdAt || "").getTime() -
            new Date(b.createdAt || "").getTime()
        );

        const base = sortedGroup[0];
        const totalBoxes = sortedGroup.reduce(
          (sum, item) => sum + Number(item.boxes || 0),
          0
        );
        const totalAmount = sortedGroup.reduce(
          (sum, item) => sum + Number(item.totalAmount || 0),
          0
        );
        const paidAmount = sortedGroup.reduce(
          (sum, item) => sum + Number(item.paidAmount || 0),
          0
        );
        const remainingAmount = sortedGroup.reduce(
          (sum, item) => sum + Number(item.remainingAmount || 0),
          0
        );

        const status = deriveGroupStatus(sortedGroup.map((item) => item.status));
        const approvalStatus = deriveGroupApproval(
          sortedGroup.map((item) => item.approvalStatus)
        );
        const paymentStatus = deriveGroupPayment(
          sortedGroup.map((item) => item.paymentStatus)
        );

        return {
          type: "bulk",
          orderId: mainOrderId,
          product: `${sortedGroup.length} Products`,
          boxes: totalBoxes,
          totalAmount,
          paidAmount,
          remainingAmount,
          status,
          paymentStatus,
          approvalStatus,
          createdAt: base.createdAt,
          totalProducts: sortedGroup.length,
          items: sortedGroup.map((item) => ({
            product: item.product,
            size: item.size || "-",
            boxes: Number(item.boxes || 0),
            itemTrackingId: item.orderId,
            status: item.status,
            approvalStatus: item.approvalStatus,
            paymentStatus: item.paymentStatus,
            totalAmount: Number(item.totalAmount || 0),
            paidAmount: Number(item.paidAmount || 0),
            remainingAmount: Number(item.remainingAmount || 0),
          })),
        };
      }
    );

    return [...singles, ...bulks].sort(
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

  useEffect(() => {
    const orderIdFromQuery = searchParams.get("openBulk");
    if (!orderIdFromQuery || !orders.length) return;

    const matchedOrder = orders.find(
      (order) => order.type === "bulk" && order.orderId === orderIdFromQuery
    );

    if (matchedOrder && matchedOrder.type === "bulk") {
      setSelectedBulkOrder(matchedOrder);
    }
  }, [searchParams, orders]);

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
      case "partially shipped":
        return "78%";
      case "shipped":
        return "85%";
      case "partially delivered":
        return "92%";
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
      case "partially shipped":
        return "bg-purple-100 text-purple-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "partially delivered":
        return "bg-emerald-100 text-emerald-700";
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

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status.toLowerCase() === "delivered"
    ).length;
    const pendingOrders = orders.filter(
      (o) => !["delivered", "cancelled"].includes(o.status.toLowerCase())
    ).length;

    return { totalOrders, completedOrders, pendingOrders };
  }, [orders]);

  if (status === "loading" || initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-[#0066ff]">
        Loading Order History...
      </div>
    );
  }

  return (
    <>
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
              Manage all your orders in one place
            </p>
          </div>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              label: "Total Orders",
              count: stats.totalOrders,
              icon: <FaBox className="text-2xl text-[#0066ff]" />,
              color: "from-[#0066ff] to-[#0052cc]",
            },
            {
              label: "Completed",
              count: stats.completedOrders,
              icon: <FaCheckCircle className="text-2xl text-green-500" />,
              color: "from-green-400 to-green-600",
            },
            {
              label: "Active",
              count: stats.pendingOrders,
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
                return (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{
                      scale: 1.015,
                      boxShadow: "0 0 25px rgba(0,102,255,0.20)",
                    }}
                    className="group flex min-h-[460px] flex-col rounded-2xl border border-white/50 bg-white/70 p-5 shadow-lg backdrop-blur-xl transition-all duration-300"
                  >
                    <div className="mb-3 flex justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-[28px] font-semibold leading-none text-gray-800">
                          {order.type === "bulk" ? "Bulk Order" : order.product}
                        </h2>

                        {order.type === "bulk" && (
                          <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#0066ff]">
                            <FaLayerGroup />
                            Bulk Order
                          </p>
                        )}
                      </div>

                      <span
                        className={`h-fit rounded-full px-3 py-1 text-xs ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            {order.type === "bulk" ? "Main Order ID" : "Order ID"}
                          </p>
                          <p className="break-all text-[15px] font-medium text-[#0066ff]">
                            {order.orderId}
                          </p>
                        </div>

                        <button
                          onClick={() => copyOrderId(order.orderId)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#0066ff]/20 bg-white px-3 py-2 text-sm font-medium text-[#0066ff] transition hover:bg-[#0066ff]/5"
                          title="Copy Order ID"
                        >
                          <FaRegCopy className="text-[11px]" />
                          {copiedId === order.orderId ? "Copied" : "Copy"}
                        </button>
                      </div>

                      <p>Boxes: {order.boxes}</p>

                      {order.type === "bulk" && (
                        <p>
                          Products: <strong>{order.totalProducts}</strong>
                        </p>
                      )}

                      <p className="text-sm">{formatDate(order.createdAt)}</p>
                    </div>

                    <hr className="my-4 border-white/40" />

                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-gray-700">
                        <FaRupeeSign /> ₹{order.totalAmount}
                      </p>
                      <p className="flex items-center gap-2 text-green-600">
                        <FaCheckCircle /> ₹{order.paidAmount}
                      </p>
                      <p className="text-gray-700">
                        Remaining: ₹{order.remainingAmount}
                      </p>
                      <p className="text-sm text-gray-500">
                        Payment: {order.paymentStatus}
                      </p>
                      <p className="text-sm text-gray-500">
                        Approval: {order.approvalStatus}
                      </p>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-[#0066ff] to-[#0052cc] transition-all duration-700"
                        style={{ width: getStatusWidth(order.status) }}
                      />
                    </div>

                    <div className="mt-5 flex-1" />

                    {order.type === "bulk" ? (
                      <button
                        onClick={() => setSelectedBulkOrder(order)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0066ff]/20 bg-[#0066ff]/5 px-4 py-3 text-sm font-semibold text-[#0066ff] transition hover:bg-[#0066ff]/10"
                      >
                        <FaListUl />
                        View Products & IDs
                      </button>
                    ) : (
                      <div className="h-[48px]" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedBulkOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedBulkOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl rounded-3xl border border-white/30 bg-white p-5 shadow-2xl sm:p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0066ff]">
                    <FaLayerGroup />
                    Bulk Order Details
                  </p>

                  <h3 className="mt-3 text-2xl font-bold text-slate-900">
                    {selectedBulkOrder.totalProducts} Products
                  </h3>

                  <p className="mt-2 break-all text-sm font-medium text-[#0066ff]">
                    {selectedBulkOrder.orderId}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedBulkOrder(null)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Products
                  </p>
                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {selectedBulkOrder.totalProducts}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Total Boxes
                  </p>
                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {selectedBulkOrder.boxes}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#0066ff]">
                    {selectedBulkOrder.status}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Approval
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {selectedBulkOrder.approvalStatus}
                  </p>
                </div>
              </div>

              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {selectedBulkOrder.items?.map((item, idx) => (
                  <div
                    key={`${item.itemTrackingId}-${idx}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {item.product}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.size} • {item.boxes} Boxes
                        </p>
                        <p className="mt-2 break-all text-sm font-medium text-[#0066ff]">
                          {item.itemTrackingId}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <button
                  onClick={() => copyOrderId(selectedBulkOrder.orderId)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#0066ff]/20 bg-white px-4 py-3 font-semibold text-[#0066ff] transition hover:bg-[#0066ff]/5"
                >
                  <FaRegCopy />
                  {copiedId === selectedBulkOrder.orderId
                    ? "Copied"
                    : "Copy Bulk Order ID"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}