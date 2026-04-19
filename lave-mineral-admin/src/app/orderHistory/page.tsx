"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaDownload,
  FaCalendarAlt,
  FaFilter,
  FaClipboardList,
  FaBoxOpen,
  FaCheckCircle,
  FaShippingFast,
  FaEye,
  FaTimes,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaWallet,
  FaFileAlt,
  FaClock,
  FaCheck,
  FaPen,
  FaShieldAlt,
  FaLayerGroup,
  FaBuilding,
  FaTags,
  FaBoxes,
} from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";

type Order = {
  orderId?: string;
  mainOrderId?: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  product?: string;
  size?: string;
  packaging?: string;
  boxes?: number;
  payment?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  discount?: number;
  paymentStatus?: "Pending" | "Partial" | "Paid";
  approvalStatus?: "Pending" | "Approved" | "Rejected";
  status?:
    | "Pending Approval"
    | "Confirmed"
    | "Processing"
    | "Packaging"
    | "Shipped"
    | "Delivered"
    | "Cancelled";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  orderType?: "Normal" | "Bulk";
  bulkOrder?: boolean;
  companyName?: string;
  category?: string;
  totalProducts?: number;
  totalBoxes?: number;
  source?: string;
  itemTrackingId?: string;
};

type ApiOrder = Order & {
  _id?: string;
  kind?: "single" | "bulk";
  type?: "single" | "bulk";
  items?: Order[];
  childOrders?: Order[];
};

type DisplayOrder = {
  id: string;
  kind: "single" | "bulk";
  orderId: string;
  mainOrderId?: string;
  userId?: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  product: string;
  size: string;
  packaging?: string;
  boxes: number;
  payment: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  discount?: number;
  paymentStatus: "Pending" | "Partial" | "Paid";
  approvalStatus: "Pending" | "Approved" | "Rejected";
  status:
    | "Pending Approval"
    | "Confirmed"
    | "Processing"
    | "Packaging"
    | "Shipped"
    | "Delivered"
    | "Cancelled";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  orderType?: "Normal" | "Bulk";
  bulkOrder?: boolean;
  companyName?: string;
  category?: string;
  totalProducts?: number;
  totalBoxes?: number;
  source?: string;
  childOrders?: Order[];
};

type StatusFilter =
  | "All"
  | "Pending Approval"
  | "Confirmed"
  | "Processing"
  | "Packaging"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

type DateFilter = "all" | "today" | "7days" | "30days" | "custom";

const PAGE_SIZE = 8;

const safeString = (value: unknown) =>
  typeof value === "string" ? value : value == null ? "" : String(value);

const safeLower = (value: unknown) => safeString(value).toLowerCase();

const safeNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export default function AdminOrderHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("30days");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editApproval, setEditApproval] =
    useState<DisplayOrder["approvalStatus"]>("Pending");
  const [editStatus, setEditStatus] =
    useState<DisplayOrder["status"]>("Pending Approval");
  const [editTotal, setEditTotal] = useState("0");
  const [editDiscount, setEditDiscount] = useState("0");
  const [editPaid, setEditPaid] = useState("0");
  const [editNotes, setEditNotes] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user?.role !== "admin") {
      router.push("/login");
    }
  }, [session, status, router]);

  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) {
        setLoading(true);
      }

      const res = await fetch("/api/orders/admin", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load orders");
      }

      const fetchedOrders = Array.isArray(data?.orders) ? data.orders : [];

      const sortedOrders = fetchedOrders.sort(
        (a: ApiOrder, b: ApiOrder) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );

      setOrders(sortedOrders);
      setError("");
    } catch (err: any) {
      setError(err?.message || "Failed to load orders");
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders(false);

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateOrder = useCallback(
    async (
      orderId: string,
      updates: Partial<{
        approvalStatus: Order["approvalStatus"];
        status: Order["status"];
        totalAmount: number;
        discount: number;
        paidAmount: number;
        notes: string;
      }>
    ) => {
      const res = await fetch("/api/orders/admin/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          ...updates,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update order");
      }
    },
    []
  );

  const isBulkOrder = useCallback((order: Partial<Order>) => {
    const notes = safeLower(order.notes);
    const packaging = safeLower(order.packaging);
    const product = safeLower(order.product);
    const company = safeLower(order.companyName);
    const orderType = safeLower(order.orderType);
    const category = safeLower(order.category);

    return Boolean(
      order.bulkOrder ||
        orderType === "bulk" ||
        category === "bulk" ||
        packaging.includes("bulk") ||
        product.includes("bulk") ||
        notes.includes("bulk") ||
        company.length > 0 ||
        safeNumber(order.totalBoxes) >= 50 ||
        safeNumber(order.boxes) >= 200
    );
  }, []);

  const getOrderDisplayType = useCallback(
    (order: Partial<Order>) => {
      return isBulkOrder(order) ? "Bulk Order" : "Standard Order";
    },
    [isBulkOrder]
  );

  const groupedDisplayOrders = useMemo<DisplayOrder[]>(() => {
    return (orders || []).map((order: ApiOrder, index: number) => {
      const apiChildOrders = Array.isArray(order.childOrders)
        ? order.childOrders
        : Array.isArray(order.items)
        ? order.items
        : [];

      const kind: "single" | "bulk" =
        order.kind === "bulk" ||
        order.type === "bulk" ||
        order.bulkOrder === true ||
        order.orderType === "Bulk" ||
        apiChildOrders.length > 0
          ? "bulk"
          : "single";

      const normalizedChildOrders: Order[] =
        kind === "bulk"
          ? apiChildOrders.map((item: any) => ({
              orderId: item.orderId || item.itemTrackingId || "",
              mainOrderId: order.mainOrderId || order.orderId || "",
              userId: item.userId || order.userId || "",
              name: item.name || order.name || "",
              email: item.email || order.email || "",
              phone: item.phone || order.phone || "",
              address: item.address || order.address || "",
              city: item.city || order.city || "",
              state: item.state || order.state || "",
              pincode: item.pincode || order.pincode || "",
              product: item.product || "",
              size: item.size || "",
              packaging: item.packaging || order.packaging || "",
              boxes: Number(item.boxes || 0),
              payment: item.payment || order.payment || "COD",
              totalAmount: Number(item.totalAmount || 0),
              paidAmount: Number(item.paidAmount || 0),
              remainingAmount: Number(item.remainingAmount || 0),
              discount: Number(item.discount || 0),
              paymentStatus: item.paymentStatus || "Pending",
              approvalStatus: item.approvalStatus || "Pending",
              status: item.status || "Pending Approval",
              notes: item.notes || "",
              createdAt: item.createdAt || order.createdAt,
              updatedAt: item.updatedAt || order.updatedAt,
              orderType: "Bulk",
              bulkOrder: true,
              companyName: item.companyName || order.companyName || "",
              category: item.category || order.category || "Bulk",
              totalProducts: Number(
                order.totalProducts || apiChildOrders.length || 0
              ),
              totalBoxes: Number(order.totalBoxes || 0),
              source: item.source || order.source || "",
            }))
          : [];

      const totalQty =
        kind === "bulk"
          ? normalizedChildOrders.reduce(
              (sum: number, item: any) => sum + Number(item.boxes || 0),
              0
            )
          : Number(order.boxes || 0);

      const totalAmount =
        kind === "bulk"
          ? normalizedChildOrders.reduce(
              (sum: number, item: any) => sum + Number(item.totalAmount || 0),
              0
            )
          : Number(order.totalAmount || 0);

      const paidAmount =
        kind === "bulk"
          ? normalizedChildOrders.reduce(
              (sum: number, item: any) => sum + Number(item.paidAmount || 0),
              0
            )
          : Number(order.paidAmount || 0);

      const remainingAmount =
        kind === "bulk"
          ? normalizedChildOrders.reduce(
              (sum: number, item: any) =>
                sum + Number(item.remainingAmount || 0),
              0
            )
          : Number(order.remainingAmount || 0);

      const discount =
        kind === "bulk"
          ? normalizedChildOrders.reduce(
              (sum: number, item: any) => sum + Number(item.discount || 0),
              0
            )
          : Number(order.discount || 0);

      const firstChild = normalizedChildOrders[0];

      return {
        id: String(order._id || order.orderId || order.mainOrderId || index),
        kind,
        orderId: String(order.orderId || order.mainOrderId || "N/A"),
        mainOrderId: String(order.mainOrderId || ""),
        userId: String(order.userId || ""),
        name: String(order.name || "Customer"),
        email: String(order.email || ""),
        phone: String(order.phone || ""),
        address: String(order.address || ""),
        city: String(order.city || ""),
        state: String(order.state || ""),
        pincode: String(order.pincode || ""),
        product:
          kind === "bulk"
            ? normalizedChildOrders.length === 1
              ? firstChild?.product || "Product"
              : `${normalizedChildOrders.length} products`
            : String(order.product || "Product"),
        size:
          kind === "bulk"
            ? normalizedChildOrders.length === 1
              ? firstChild?.size || "-"
              : `${normalizedChildOrders.length} item sizes`
            : String(order.size || "-"),
        packaging: String(order.packaging || ""),
        boxes: Number(
          kind === "bulk" ? order.totalBoxes || totalQty : order.boxes || 0
        ),
        payment: String(order.payment || "COD"),
        totalAmount,
        paidAmount,
        remainingAmount,
        discount,
        paymentStatus: order.paymentStatus || "Pending",
        approvalStatus: order.approvalStatus || "Pending",
        status: order.status || "Pending Approval",
        notes: String(order.notes || ""),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        orderType: kind === "bulk" ? "Bulk" : "Normal",
        bulkOrder: kind === "bulk",
        companyName: String(order.companyName || ""),
        category: String(order.category || (kind === "bulk" ? "Bulk" : "")),
        totalProducts:
          kind === "bulk"
            ? Number(order.totalProducts || normalizedChildOrders.length || 0)
            : 1,
        totalBoxes:
          kind === "bulk"
            ? Number(order.totalBoxes || totalQty || 0)
            : Number(order.boxes || 0),
        source: String(order.source || ""),
        childOrders: normalizedChildOrders,
      };
    });
  }, [orders]);

  const stats = useMemo(() => {
    return {
      total: groupedDisplayOrders.length,
      confirmed: groupedDisplayOrders.filter((o) => o.status === "Confirmed")
        .length,
      processing: groupedDisplayOrders.filter((o) => o.status === "Processing")
        .length,
      packaging: groupedDisplayOrders.filter((o) => o.status === "Packaging")
        .length,
      pendingApproval: groupedDisplayOrders.filter(
        (o) => o.status === "Pending Approval"
      ).length,
      shipped: groupedDisplayOrders.filter((o) => o.status === "Shipped").length,
      delivered: groupedDisplayOrders.filter((o) => o.status === "Delivered")
        .length,
      bulk: groupedDisplayOrders.filter((o) => o.kind === "bulk").length,
    };
  }, [groupedDisplayOrders]);

  const filteredOrders = useMemo(() => {
    const query = safeLower(search.trim());
    const now = new Date();

    return groupedDisplayOrders.filter((order) => {
      const orderTypeLabel = getOrderDisplayType(order).toLowerCase();
      const childOrders = order.childOrders || [];

      const childMatch = childOrders.some((item) => {
        return (
          safeLower(item.orderId).includes(query) ||
          safeLower(item.product).includes(query) ||
          safeLower(item.size).includes(query)
        );
      });

      const matchesSearch =
        !query ||
        safeLower(order.orderId).includes(query) ||
        safeLower(order.mainOrderId).includes(query) ||
        safeLower(order.name).includes(query) ||
        safeLower(order.phone).includes(query) ||
        safeLower(order.product).includes(query) ||
        safeLower(order.status).includes(query) ||
        orderTypeLabel.includes(query) ||
        safeLower(order.companyName).includes(query) ||
        safeLower(order.packaging).includes(query) ||
        (query === "bulk" && order.kind === "bulk") ||
        childMatch;

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      let matchesDate = true;

      if (order.createdAt) {
        const created = new Date(order.createdAt);

        if (dateFilter === "today") {
          matchesDate = created.toDateString() === now.toDateString();
        } else if (dateFilter === "7days") {
          matchesDate =
            now.getTime() - created.getTime() <= 7 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === "30days") {
          matchesDate =
            now.getTime() - created.getTime() <= 30 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === "custom") {
          const from = fromDate ? new Date(fromDate) : null;
          const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

          if (from && created < from) matchesDate = false;
          if (to && created > to) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [
    groupedDisplayOrders,
    search,
    statusFilter,
    dateFilter,
    fromDate,
    toDate,
    getOrderDisplayType,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const exportCSV = () => {
    const headers = [
      "Order ID",
      "Main Order ID",
      "Customer",
      "Order Type",
      "Company Name",
      "Phone",
      "Product",
      "Size",
      "Packaging",
      "Quantity",
      "Items Count",
      "Total",
      "Paid",
      "Remaining",
      "Approval Status",
      "Order Status",
      "Payment Status",
      "Date",
    ];

    const rows = filteredOrders.map((o) => [
      o.orderId,
      o.mainOrderId || "",
      o.name,
      getOrderDisplayType(o),
      o.companyName || "",
      o.phone,
      o.product,
      o.size,
      o.packaging || "",
      o.totalBoxes || o.boxes,
      o.kind === "bulk" ? o.totalProducts || o.childOrders?.length || 0 : 1,
      o.totalAmount,
      o.paidAmount,
      o.remainingAmount,
      o.approvalStatus,
      o.status,
      o.paymentStatus,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lave-admin-order-detail.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const normalizePhoneForWhatsApp = (phone: string) => {
    let digits = safeString(phone).replace(/\D/g, "");

    if (digits.length === 10) digits = `91${digits}`;
    if (digits.startsWith("0") && digits.length > 10) {
      digits = digits.replace(/^0+/, "");
    }

    return digits;
  };

  const buildWhatsAppMessage = (order: DisplayOrder) => {
    if (order.kind === "bulk") {
      const itemLines = (order.childOrders || [])
        .map(
          (item, index) =>
            `${index + 1}. ${safeString(item.product)} (${safeString(
              item.size
            )}) - ${safeNumber(item.boxes)} boxes`
        )
        .join("\n");

      return `Hello ${order.name},

Regarding your bulk order:

Main Order ID: ${order.orderId}
Total Quantity: ${order.totalBoxes || order.boxes}
Items: ${order.totalProducts || order.childOrders?.length || 0}

${itemLines}

Thank you,
Lave Mineral Water Team`;
    }

    return `Hello ${order.name},

Regarding your order:

Order ID: ${order.orderId}
Order Type: ${getOrderDisplayType(order)}
Product: ${order.product}
Quantity: ${order.boxes}

Thank you,
Lave Mineral Water Team`;
  };

  const openWhatsApp = (order: DisplayOrder) => {
    const phone = normalizePhoneForWhatsApp(order.phone);

    if (!phone) {
      alert("Customer phone number not available.");
      return;
    }

    const message = encodeURIComponent(buildWhatsAppMessage(order));
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, "_blank");
  };

  const openEditModal = (order: DisplayOrder) => {
    setSelectedOrder(order);
    setEditApproval(order.approvalStatus);
    setEditStatus(order.status);
    setEditTotal(String(order.totalAmount || 0));
    setEditDiscount(String(order.discount || 0));
    setEditPaid(String(order.paidAmount || 0));
    setEditNotes(order.notes || "");
    setEditOpen(true);
  };

  const closeAllModals = () => {
    setSelectedOrder(null);
    setEditOpen(false);
  };

  const saveOrder = async () => {
    if (!selectedOrder) return;

    try {
      setSaving(true);

      if (selectedOrder.kind === "bulk" && selectedOrder.childOrders?.length) {
        const childCount = selectedOrder.childOrders.length;
        const totalAmountValue = Number(editTotal || 0);
        const discountValue = Number(editDiscount || 0);
        const paidAmountValue = Number(editPaid || 0);

        await Promise.all(
          selectedOrder.childOrders.map((child, index) => {
            const childOrderId = safeString(child.orderId);
            if (!childOrderId) return Promise.resolve();

            const isLast = index === childCount - 1;

            const baseTotal = Math.floor(totalAmountValue / childCount);
            const baseDiscount = Math.floor(discountValue / childCount);
            const basePaid = Math.floor(paidAmountValue / childCount);

            const distributedTotal = isLast
              ? totalAmountValue - baseTotal * (childCount - 1)
              : baseTotal;

            const distributedDiscount = isLast
              ? discountValue - baseDiscount * (childCount - 1)
              : baseDiscount;

            const distributedPaid = isLast
              ? paidAmountValue - basePaid * (childCount - 1)
              : basePaid;

            return updateOrder(childOrderId, {
              approvalStatus: editApproval,
              status: editStatus,
              totalAmount: distributedTotal,
              discount: distributedDiscount,
              paidAmount: distributedPaid,
              notes: editNotes,
            });
          })
        );
      } else {
        await updateOrder(selectedOrder.orderId, {
          approvalStatus: editApproval,
          status: editStatus,
          totalAmount: Number(editTotal || 0),
          discount: Number(editDiscount || 0),
          paidAmount: Number(editPaid || 0),
          notes: editNotes,
        });
      }

      await fetchOrders(true);
      closeAllModals();
    } catch (err: any) {
      alert(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-[#eef5ff] text-gray-800 flex items-center justify-center">
        Loading order details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#edf4ff_0%,#f7fbff_30%,#ffffff_100%)] text-gray-800">
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_center,rgba(0,102,255,0.11),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(0,102,255,0.07),transparent_24%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-56 w-[72%] rounded-full bg-[#0066ff]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-[1580px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7"
          >
            <div className="overflow-hidden rounded-[36px] border border-[#6ea7ff]/20 bg-gradient-to-r from-[#0a63f3] via-[#156df6] to-[#4b91f6] shadow-[0_28px_80px_rgba(0,102,255,0.22)]">
              <div className="bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_40%,transparent)] px-6 py-8 sm:px-9 sm:py-10">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                      Lave Mineral
                    </p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                      Order Details
                    </h1>
                    <p className="mt-3 text-sm text-white/85 max-w-2xl">
                      Standard and bulk orders are managed together with the same admin flow.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md shadow-[0_10px_24px_rgba(255,255,255,0.08)]">
                      <FaShieldAlt />
                      Administrator
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md shadow-[0_10px_24px_rgba(255,255,255,0.08)]">
                      <FaLayerGroup />
                      Bulk Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="mb-6 grid grid-cols-1 xl:grid-cols-[1.45fr_1fr_1fr_auto] gap-4"
          >
            <FilterShell>
              <FaSearch className="text-[#0066ff] text-sm shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order id, main order id, customer, product, bulk..."
                className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
              />
            </FilterShell>

            <FilterShell>
              <FaFilter className="text-[#0066ff] text-sm shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full bg-transparent outline-none text-slate-800"
              >
                <option className="text-black">All</option>
                <option className="text-black">Pending Approval</option>
                <option className="text-black">Confirmed</option>
                <option className="text-black">Processing</option>
                <option className="text-black">Packaging</option>
                <option className="text-black">Shipped</option>
                <option className="text-black">Delivered</option>
                <option className="text-black">Cancelled</option>
              </select>
            </FilterShell>

            <FilterShell>
              <FaCalendarAlt className="text-[#0066ff] text-sm shrink-0" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="w-full bg-transparent outline-none text-slate-800"
              >
                <option className="text-black" value="all">
                  All Time
                </option>
                <option className="text-black" value="today">
                  Today
                </option>
                <option className="text-black" value="7days">
                  Last 7 Days
                </option>
                <option className="text-black" value="30days">
                  Last 30 Days
                </option>
                <option className="text-black" value="custom">
                  Custom Range
                </option>
              </select>
            </FilterShell>

            <motion.button
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportCSV}
              className="h-[56px] rounded-2xl px-5 bg-gradient-to-r from-[#0057db] via-[#0066ff] to-[#3387ff] text-white font-semibold shadow-[0_18px_36px_rgba(0,102,255,0.24)] border border-[#cfe2ff]/20 flex items-center justify-center gap-2 hover:shadow-[0_24px_48px_rgba(0,102,255,0.30)] transition-all"
            >
              <FaDownload />
              Export
            </motion.button>
          </motion.section>

          {dateFilter === "custom" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <FilterInput label="From Date" value={fromDate} onChange={setFromDate} />
              <FilterInput label="To Date" value={toDate} onChange={setToDate} />
            </motion.div>
          )}

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-7"
          >
            <KpiCard title="Total Orders" value={stats.total} icon={<FaClipboardList />} />
            <KpiCard title="Bulk Orders" value={stats.bulk} icon={<FaLayerGroup />} />
            <KpiCard title="Confirmed" value={stats.confirmed} icon={<FaCheck />} />
            <KpiCard title="Processing" value={stats.processing} icon={<FaBoxOpen />} />
            <KpiCard title="Packaging" value={stats.packaging} icon={<FaBoxOpen />} />
            <KpiCard title="Pending Approval" value={stats.pendingApproval} icon={<FaClock />} />
            <KpiCard title="Shipped" value={stats.shipped} icon={<FaShippingFast />} />
            <KpiCard title="Delivered" value={stats.delivered} icon={<FaCheckCircle />} />
          </motion.section>

          {stats.bulk > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-7 rounded-[28px] border border-[#d8e8ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(240,247,255,0.94)_100%)] backdrop-blur-2xl p-5 shadow-[0_18px_40px_rgba(0,102,255,0.08)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe2ff] bg-[#eef5ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0066ff]">
                    <FaLayerGroup />
                    Bulk Order Overview
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    Bulk orders are highlighted across list and detail view
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Parent bulk orders show one main order row, and view opens all child item orders.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <MiniStat label="Bulk Orders" value={stats.bulk} />
                  <MiniStat
                    label="Bulk Share"
                    value={
                      stats.total > 0
                        ? `${Math.round((stats.bulk / stats.total) * 100)}%`
                        : "0%"
                    }
                  />
                  <MiniStat
                    label="Bulk Qty"
                    value={String(
                      groupedDisplayOrders
                        .filter((o) => o.kind === "bulk")
                        .reduce(
                          (sum, o) => sum + Number(o.totalBoxes || o.boxes || 0),
                          0
                        )
                    )}
                  />
                </div>
              </div>
            </motion.section>
          )}

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.09 }}
            className="rounded-[30px] border border-white/75 bg-white/68 backdrop-blur-2xl shadow-[0_28px_70px_rgba(15,23,42,0.07)] overflow-hidden"
          >
            {error && (
              <div className="px-5 py-4 border-b border-slate-200 text-red-600 bg-red-50">
                {error}
              </div>
            )}

            {loading ? (
              <div className="px-5 py-16 text-center text-slate-500">
                Loading orders...
              </div>
            ) : paginatedOrders.length === 0 ? (
              <div className="px-5 py-16 text-center text-slate-500">
                No orders found for the selected filters.
              </div>
            ) : (
              <>
                <div className="hidden xl:block">
                  <AnimatePresence mode="popLayout">
                    {paginatedOrders.map((order, index) => {
                      const bulk = order.kind === "bulk";

                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          whileHover={{ y: -2 }}
                          transition={{ duration: 0.24, delay: index * 0.03 }}
                          className={`group grid grid-cols-[1.15fr_1.55fr_0.9fr_0.9fr_0.95fr_1.05fr_0.8fr] gap-4 px-6 py-4 border-b items-center transition-all ${
                            bulk
                              ? "border-[#d9e9ff] bg-[linear-gradient(90deg,rgba(238,245,255,0.9)_0%,rgba(255,255,255,0.96)_36%)] hover:bg-[linear-gradient(90deg,rgba(232,243,255,0.95)_0%,rgba(255,255,255,0.98)_36%)]"
                              : "border-slate-100 hover:bg-[#f8fbff]/95"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-[#0066ff] break-all">
                              #{order.orderId}
                            </div>
                            {bulk && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                <BulkBadge />
                                <span className="inline-flex items-center rounded-full bg-white border border-[#dbe7f6] px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                  {order.totalProducts || order.childOrders?.length || 0} items
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                                bulk
                                  ? "bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] border-[#bfdcff]"
                                  : "bg-gradient-to-br from-[#eef5ff] to-[#dcecff] border-[#d7e8ff]"
                              }`}
                            >
                              {bulk ? (
                                <FaBuilding className="text-[#0066ff] text-sm" />
                              ) : (
                                <FaUser className="text-[#0066ff] text-sm" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold truncate text-slate-900">
                                  {order.name}
                                </p>
                                {bulk && (
                                  <span className="inline-flex items-center rounded-full bg-[#eef5ff] border border-[#cfe2ff] px-2.5 py-1 text-[11px] font-semibold text-[#0066ff]">
                                    Priority
                                  </span>
                                )}
                              </div>

                              <p className="text-slate-500 text-sm truncate">
                                {order.phone}
                              </p>

                              {bulk ? (
                                <p className="text-xs text-slate-500 truncate mt-1">
                                  Main bulk request • {(order.childOrders || [])
                                    .slice(0, 2)
                                    .map((item) => `${safeString(item.product)} (${safeString(item.size)})`)
                                    .join(", ")}
                                  {(order.childOrders?.length || 0) > 2 ? "..." : ""}
                                </p>
                              ) : (
                                (order.companyName || order.packaging) && (
                                  <p className="text-xs text-slate-500 truncate mt-1">
                                    {order.companyName
                                      ? order.companyName
                                      : order.packaging}
                                  </p>
                                )
                              )}
                            </div>
                          </div>

                          <div className="text-slate-600">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "-"}
                          </div>

                          <div className="font-semibold text-slate-800">
                            ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                          </div>

                          <div className="font-semibold text-slate-700">
                            <div>{order.totalBoxes || order.boxes || 0}</div>
                            {bulk && (
                              <div className="mt-1 text-[11px] font-medium text-[#0066ff]">
                                Total qty
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <span
                              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold border shadow-sm ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>

                            <div>
                              <span className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-semibold border border-[#dbe7f6] bg-white text-slate-600">
                                {getOrderDisplayType(order)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <motion.button
                              whileHover={{ y: -2, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedOrder(order);
                                setEditOpen(false);
                              }}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] transition-all flex items-center gap-2 shadow-sm"
                            >
                              <FaEye className="text-[#0066ff]" />
                              View
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="xl:hidden p-4 sm:p-5 space-y-4">
                  {paginatedOrders.map((order) => (
                    <MobileGroupedCard
                      key={order.id}
                      order={order}
                      onView={() => {
                        setSelectedOrder(order);
                        setEditOpen(false);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.section>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="text-slate-900 font-medium">
                {paginatedOrders.length}
              </span>{" "}
              of{" "}
              <span className="text-slate-900 font-medium">
                {filteredOrders.length}
              </span>{" "}
              filtered entries
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:shadow-[0_10px_20px_rgba(15,23,42,0.06)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </motion.button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;

                  if (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition-all ${
                          currentPage === page
                            ? "bg-[#0066ff] text-white shadow-[0_12px_26px_rgba(0,102,255,0.22)]"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
                        }`}
                      >
                        {page}
                      </motion.button>
                    );
                  }

                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-1 text-slate-400">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:shadow-[0_10px_20px_rgba(15,23,42,0.06)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedOrder && !editOpen && (
          <Modal onClose={closeAllModals}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[#0066ff] uppercase tracking-[0.18em] text-[11px] font-semibold">
                    Order Detail
                  </p>
                  {selectedOrder.kind === "bulk" && <BulkBadge />}
                </div>

                <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 break-all">
                  #{selectedOrder.orderId}
                </h3>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 6 }}
                whileTap={{ scale: 0.96 }}
                onClick={closeAllModals}
                className="h-11 w-11 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] flex items-center justify-center transition-all text-slate-700"
              >
                <FaTimes />
              </motion.button>
            </div>

            {selectedOrder.kind === "bulk" && (
              <div className="mb-4 rounded-2xl border border-[#cfe2ff] bg-[linear-gradient(180deg,#f7fbff_0%,#edf5ff_100%)] p-4 shadow-[0_10px_24px_rgba(0,102,255,0.08)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#cfe2ff] bg-white text-[#0066ff] shrink-0">
                    <FaLayerGroup />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0066ff]">
                      Main bulk order view
                    </p>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      This parent order groups all child item orders under one main bulk request.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoBox icon={<FaUser />} label="Customer" value={selectedOrder.name} />
              <InfoBox icon={<FaPhone />} label="Phone" value={selectedOrder.phone} />
              <InfoBox
                icon={<FaClipboardList />}
                label={selectedOrder.kind === "bulk" ? "Products" : "Product"}
                value={
                  selectedOrder.kind === "bulk"
                    ? `${selectedOrder.totalProducts || selectedOrder.childOrders?.length || 0} items in this bulk order`
                    : `${selectedOrder.product} • ${selectedOrder.size}`
                }
              />
              <InfoBox
                icon={<FaClock />}
                label="Created"
                value={
                  selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString()
                    : "-"
                }
              />
              <InfoBox
                icon={<FaWallet />}
                label="Total Amount"
                value={`₹${Number(selectedOrder.totalAmount || 0).toLocaleString(
                  "en-IN"
                )}`}
              />
              <InfoBox
                icon={<FaBoxOpen />}
                label={selectedOrder.kind === "bulk" ? "Total Quantity" : "Quantity"}
                value={String(selectedOrder.totalBoxes || selectedOrder.boxes || 0)}
              />
              <InfoBox
                icon={<FaCheckCircle />}
                label="Approval Status"
                value={selectedOrder.approvalStatus}
              />
              <InfoBox
                icon={<FaShippingFast />}
                label="Order Status"
                value={selectedOrder.status}
              />
              <InfoBox
                icon={<FaLayerGroup />}
                label="Order Type"
                value={getOrderDisplayType(selectedOrder)}
              />
              <InfoBox
                icon={<FaTags />}
                label="Packaging"
                value={selectedOrder.packaging || "-"}
              />

              {selectedOrder.companyName && (
                <InfoBox
                  icon={<FaBuilding />}
                  label="Company Name"
                  value={selectedOrder.companyName}
                />
              )}

              {selectedOrder.kind === "bulk" && (
                <InfoBox
                  icon={<FaBoxes />}
                  label="Items Count"
                  value={String(
                    selectedOrder.totalProducts ||
                      selectedOrder.childOrders?.length ||
                      0
                  )}
                />
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-[#0066ff] mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 mb-1">Address</p>
                  <p className="text-slate-800 leading-relaxed">
                    {selectedOrder.address}
                    {selectedOrder.city ? `, ${selectedOrder.city}` : ""}
                    {selectedOrder.state ? `, ${selectedOrder.state}` : ""}
                    {selectedOrder.pincode ? ` - ${selectedOrder.pincode}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {selectedOrder.kind === "bulk" && selectedOrder.childOrders?.length ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eef5ff] to-[#dcecff] text-[#0066ff] border border-[#d7e8ff] shadow-[0_10px_24px_rgba(0,102,255,0.08)]">
                    <FaBoxes />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Child orders in this bulk request
                    </p>
                    <p className="text-xs text-slate-500">
                      View all product-wise orders under the main bulk order
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedOrder.childOrders.map((item, idx) => (
                    <div
                      key={
                        safeString(item.orderId) ||
                        safeString(item.itemTrackingId) ||
                        `${safeString(item.product)}-${idx}`
                      }
                      className="rounded-2xl border border-[#e4edf9] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#0066ff] break-all">
                            {safeString(item.orderId || item.itemTrackingId) || "N/A"}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {safeString(item.product) || "Product"} • {safeString(item.size) || "-"}
                          </p>
                          <p className="text-sm text-slate-500">
                            Quantity: {safeNumber(item.boxes)} boxes
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold border shadow-sm ${getStatusBadge(
                              item.status || "Pending Approval"
                            )}`}
                          >
                            {item.status || "Pending Approval"}
                          </span>

                          <span className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold border border-[#dbe7f6] bg-white text-slate-700">
                            {item.approvalStatus || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {selectedOrder.notes && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-start gap-3">
                  <FaFileAlt className="text-[#0066ff] mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Notes</p>
                    <p className="text-slate-800 leading-relaxed">
                      {selectedOrder.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openWhatsApp(selectedOrder)}
                className="rounded-2xl border border-green-200 bg-green-50 px-5 py-3 text-green-700 font-semibold hover:bg-green-100 hover:shadow-[0_14px_30px_rgba(34,197,94,0.14)] transition-all flex items-center gap-2"
              >
                <FaWhatsapp />
                WhatsApp
              </motion.button>

              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openEditModal(selectedOrder)}
                className="rounded-2xl bg-gradient-to-r from-[#0057db] to-[#0066ff] px-5 py-3 text-white font-semibold shadow-[0_16px_34px_rgba(0,102,255,0.22)] hover:shadow-[0_22px_46px_rgba(0,102,255,0.30)] transition-all flex items-center gap-2"
              >
                <FaPen />
                Edit Order
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editOpen && selectedOrder && (
          <Modal onClose={closeAllModals}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[#0066ff] uppercase tracking-[0.18em] text-[11px] font-semibold">
                    Edit Order
                  </p>
                  {selectedOrder.kind === "bulk" && <BulkBadge />}
                </div>

                <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 break-all">
                  #{selectedOrder.orderId}
                </h3>
                {selectedOrder.kind === "bulk" && (
                  <p className="mt-2 text-sm text-slate-500">
                    Changes will be applied to all child orders in this bulk request.
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 6 }}
                whileTap={{ scale: 0.96 }}
                onClick={closeAllModals}
                className="h-11 w-11 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] flex items-center justify-center transition-all text-slate-700"
              >
                <FaTimes />
              </motion.button>
            </div>

            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Approval Status">
                  <select
                    value={editApproval}
                    onChange={(e) => {
                      const value = e.target.value as DisplayOrder["approvalStatus"];
                      setEditApproval(value);

                      if (
                        value === "Approved" &&
                        editStatus === "Pending Approval"
                      ) {
                        setEditStatus("Confirmed");
                      }
                      if (value === "Rejected") {
                        setEditStatus("Cancelled");
                      }
                      if (value === "Pending") {
                        setEditStatus("Pending Approval");
                      }
                    }}
                    className="input-light"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </Field>

                <Field label="Order Status">
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as DisplayOrder["status"])
                    }
                    className="input-light"
                  >
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Total Amount">
                  <input
                    value={editTotal}
                    onChange={(e) => setEditTotal(e.target.value)}
                    type="number"
                    className="input-light"
                  />
                </Field>

                <Field label="Discount">
                  <input
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                    type="number"
                    className="input-light"
                  />
                </Field>

                <Field label="Paid Amount">
                  <input
                    value={editPaid}
                    onChange={(e) => setEditPaid(e.target.value)}
                    type="number"
                    className="input-light"
                  />
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  rows={5}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="input-light resize-none"
                  placeholder="Internal admin note..."
                />
              </Field>

              <div className="flex justify-end gap-3 pt-2">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeAllModals}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 hover:bg-slate-50 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition-all text-slate-700"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveOrder}
                  disabled={saving}
                  className="rounded-2xl bg-gradient-to-r from-[#0057db] to-[#0066ff] px-5 py-3 font-semibold text-white shadow-[0_16px_34px_rgba(0,102,255,0.22)] hover:shadow-[0_22px_46px_rgba(0,102,255,0.30)] transition-all disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .input-light {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid #dbe7f6;
          background: rgba(255, 255, 255, 0.95);
          color: #1e293b;
          padding: 0.95rem 1rem;
          outline: none;
          transition: 0.25s ease;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.03);
        }
        .input-light:hover {
          border-color: rgba(0, 102, 255, 0.22);
          box-shadow: 0 14px 28px rgba(0, 102, 255, 0.08);
        }
        .input-light:focus {
          border-color: rgba(0, 102, 255, 0.45);
          box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.12);
        }
      `}</style>
    </div>
  );
}

function FilterShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className="h-[56px] rounded-2xl border border-white/75 bg-white/68 backdrop-blur-xl px-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_40px_rgba(0,102,255,0.10)] hover:border-[#d9e9ff] transition-all flex items-center gap-3"
    >
      {children}
    </motion.div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/75 bg-white/68 backdrop-blur-xl px-4 py-3 shadow-[0_14px_32px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_40px_rgba(0,102,255,0.10)] transition-all"
    >
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none text-slate-800"
      />
    </motion.div>
  );
}

function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.22 }}
      className="group rounded-[24px] border border-white/75 bg-white/72 backdrop-blur-2xl px-4 py-4 shadow-[0_20px_44px_rgba(15,23,42,0.05)] hover:bg-[#0066ff] hover:border-[#0066ff] hover:shadow-[0_30px_60px_rgba(0,102,255,0.26)] transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: -8, scale: 1.08 }}
          transition={{ duration: 0.2 }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eef5ff] to-[#dcecff] text-[#0066ff] border border-[#d7e8ff] shrink-0 shadow-[0_10px_24px_rgba(0,102,255,0.10)]"
        >
          {icon}
        </motion.div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 leading-5 group-hover:text-white/90 transition-colors">
            {title}
          </p>
          <p className="mt-2 text-[2rem] leading-none font-bold text-slate-900 group-hover:text-white transition-colors">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-[rgba(226,237,255,0.58)] backdrop-blur-md p-4 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 28, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.96 }}
        transition={{ duration: 0.24 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl rounded-[30px] border border-white/80 bg-white/88 backdrop-blur-2xl shadow-[0_34px_90px_rgba(15,23,42,0.14)] p-5 sm:p-6 text-slate-800 max-h-[90vh] overflow-y-auto"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-2 text-sm text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_32px_rgba(0,102,255,0.08)] transition-all"
    >
      <div className="flex items-center gap-2 text-[#0066ff] mb-2">{icon}</div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-slate-800 font-semibold break-words">{value}</p>
    </motion.div>
  );
}

function BulkBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#b9d8ff] bg-[linear-gradient(180deg,#eef6ff_0%,#dcecff_100%)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0066ff] shadow-[0_8px_20px_rgba(0,102,255,0.10)]">
      <FaLayerGroup />
      Bulk Order
    </span>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-[#d9e9ff] bg-white/90 px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function MobileGroupedCard({
  order,
  onView,
}: {
  order: DisplayOrder;
  onView: () => void;
}) {
  const isBulk = order.kind === "bulk";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22 }}
      className={`relative overflow-hidden rounded-[28px] border bg-white/72 backdrop-blur-2xl shadow-[0_22px_48px_rgba(15,23,42,0.08)] ${
        isBulk ? "border-[#d7e8ff]" : "border-white/75"
      }`}
    >
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {isBulk && <BulkBadge />}
          {isBulk && (
            <span className="inline-flex items-center rounded-full bg-white border border-[#dbe7f6] px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {order.totalProducts || order.childOrders?.length || 0} items
            </span>
          )}
        </div>

        <div className="font-bold text-[#0066ff] break-all">#{order.orderId}</div>

        <div className="flex items-center gap-3">
          <div
            className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
              isBulk
                ? "bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] border-[#bfdcff]"
                : "bg-gradient-to-br from-[#eef5ff] to-[#dcecff] border-[#d7e8ff]"
            }`}
          >
            {isBulk ? (
              <FaBuilding className="text-[#0066ff] text-sm" />
            ) : (
              <FaUser className="text-[#0066ff] text-sm" />
            )}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{order.name}</p>
            <p className="text-sm text-slate-500">{order.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MiniInfo
            icon={<FaClock />}
            label="Date"
            value={
              order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "-"
            }
          />
          <MiniInfo
            icon={<FaBoxOpen />}
            label={isBulk ? "Total Qty" : "Quantity"}
            value={String(order.totalBoxes || order.boxes || 0)}
          />
          <MiniInfo
            icon={<FaWallet />}
            label="Total"
            value={`₹${Number(order.totalAmount || 0).toLocaleString("en-IN")}`}
          />
          <MiniInfo
            icon={<FaClipboardList />}
            label={isBulk ? "Items" : "Product"}
            value={
              isBulk
                ? `${order.totalProducts || order.childOrders?.length || 0} items`
                : order.product
            }
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold border shadow-sm ${getStatusBadge(
              order.status
            )}`}
          >
            {order.status}
          </span>

          <span className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-semibold border border-[#dbe7f6] bg-white text-slate-600">
            {isBulk ? "Bulk Order" : "Standard Order"}
          </span>
        </div>

        <motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onView}
          className="w-full rounded-[20px] bg-gradient-to-r from-[#0058df] via-[#0066ff] to-[#2f8cff] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,102,255,0.20)] hover:shadow-[0_18px_38px_rgba(0,102,255,0.28)] transition-all"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
      <div className="mb-2 text-[#0066ff]">{icon}</div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800 leading-relaxed break-words">
        {value}
      </p>
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Processing":
      return "bg-[#eef5ff] text-[#0066ff] border-[#cfe2ff]";
    case "Packaging":
      return "bg-[#eef5ff] text-[#0066ff] border-[#cfe2ff]";
    case "Pending Approval":
      return "bg-[#eef5ff] text-[#0066ff] border-[#cfe2ff]";
    case "Delivered":
      return "bg-[#eef5ff] text-[#0066ff] border-[#cfe2ff]";
    case "Shipped":
      return "bg-[#eef5ff] text-[#0066ff] border-[#cfe2ff]";
    case "Confirmed":
      return "bg-[#eef5ff] text-[#0066ff] border-[#cfe2ff]";
    case "Cancelled":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}