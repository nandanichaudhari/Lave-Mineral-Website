"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaBoxOpen,
  FaCheckCircle,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

interface CartItem {
  productId: number;
  name: string;
  img: string;
  size: string;
  qty: number;
  status?: string;
}

interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const PACKING_INFO: Record<string, Record<string, string>> = {
  Square: {
    "1L": "1 Litre - 12 Packing",
    "1 LITRE": "1 Litre - 12 Packing",
    "1 LITER": "1 Litre - 12 Packing",
    "500ML": "500 ML - 24 Packing",
    "250ML": "250 ML - 35 Packing / 40 Packing",
  },
  Premium: {
    "1L": "1 Litre - 12 Packing",
    "1 LITRE": "1 Litre - 12 Packing",
    "1 LITER": "1 Litre - 12 Packing",
    "500ML": "500 ML - 24 Packing",
    "250ML": "250 ML - 30 Packing / 35 Packing",
  },
};

function getBottleType(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("premium")) return "Premium";
  return "Square";
}

function normalizeSize(size: string) {
  return size.replace(/\s+/g, "").toUpperCase();
}

function getPackingLine(name: string, size: string) {
  const type = getBottleType(name);
  const normalizedSize = normalizeSize(size);

  if (
    normalizedSize === "1L" ||
    normalizedSize === "1LITRE" ||
    normalizedSize === "1LITER"
  ) {
    return PACKING_INFO[type]["1L"];
  }

  if (normalizedSize === "500ML") {
    return PACKING_INFO[type]["500ML"];
  }

  if (normalizedSize === "250ML") {
    return PACKING_INFO[type]["250ML"];
  }

  return "Packing details not available";
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CartItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchCart = async (showPageLoader = false) => {
    try {
      if (showPageLoader) {
        setLoading(true);
      }

      const res = await fetch("/api/cart", {
        cache: "no-store",
      });

      const data = await res.json();
      setCart(Array.isArray(data?.cart?.items) ? data.cart.items : []);
    } catch (err) {
      console.error(err);
      if (showPageLoader) {
        setCart([]);
      }
    } finally {
      if (showPageLoader) {
        setLoading(false);
      }
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      const userData = data?.user || data?.profile || data || null;

      setProfile({
        name: userData?.name || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        address: userData?.address || "",
        city: userData?.city || "",
        state: userData?.state || "",
        pincode: userData?.pincode || "",
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      setProfile(null);
    }
  };

  useEffect(() => {
    fetchCart(true);
    fetchProfile();
  }, []);

  const increaseQty = async (item: CartItem) => {
    const previousCart = [...cart];

    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.productId === item.productId
          ? { ...cartItem, qty: cartItem.qty + 1 }
          : cartItem
      )
    );

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: {
            productId: item.productId,
            name: item.name,
            img: item.img,
            size: item.size,
            qty: 1,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to increase quantity");
      }
    } catch (error) {
      console.error(error);
      setCart(previousCart);
    }
  };

  const decreaseQty = async (item: CartItem) => {
    if (item.qty <= 1) return;

    const previousCart = [...cart];

    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.productId === item.productId
          ? { ...cartItem, qty: cartItem.qty - 1 }
          : cartItem
      )
    );

    try {
      const deleteRes = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.productId,
        }),
      });

      if (!deleteRes.ok) {
        throw new Error("Failed to decrease quantity");
      }

      const addRes = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: {
            productId: item.productId,
            name: item.name,
            img: item.img,
            size: item.size,
            qty: item.qty - 1,
          },
        }),
      });

      if (!addRes.ok) {
        throw new Error("Failed to sync decreased quantity");
      }
    } catch (error) {
      console.error(error);
      setCart(previousCart);
    }
  };

  const removeItem = async (id: number) => {
    const previousCart = [...cart];

    setCart((prev) => prev.filter((item) => item.productId !== id));

    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: id }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove item");
      }
    } catch (error) {
      console.error(error);
      setCart(previousCart);
    }
  };

  const totalBoxes = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.qty, 0);
  }, [cart]);

  const totalProducts = useMemo(() => {
    return cart.length;
  }, [cart]);

  const minimumReached = totalBoxes >= 50;
  const boxesNeeded = Math.max(0, 50 - totalBoxes);

  const handleBuyAll = async () => {
    try {
      if (!cart.length) return;

      setCheckoutLoading(true);

      const checkoutData = {
        items: cart,
        totalBoxes,
        customer: profile || {},
        checkoutType: "cart-bulk",
      };

      localStorage.setItem("cartCheckoutData", JSON.stringify(checkoutData));
      window.location.href = "/order/cart-checkout";
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eef6ff] via-white to-[#f7fbff] text-slate-800">
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8 rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_20px_60px_rgba(0,102,255,0.08)] backdrop-blur-xl md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0066FF]/15 bg-[#0066FF]/8 px-4 py-2 text-sm font-semibold text-[#0066FF]">
                <HiSparkles className="text-base" />
                Bulk Bottle Checkout Experience
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Your Cart
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Add all required bottles together and place one combined bulk
                order.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Total Items
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalProducts}
                </p>
              </div>

              <div className="rounded-2xl border border-[#0066FF]/20 bg-[#0066FF]/5 px-5 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
                  Total Boxes
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0066FF]">
                  {totalBoxes}
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center md:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Minimum Rule
                </p>
                <p className="mt-2 text-lg font-bold text-emerald-700">
                  50 Boxes
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-medium">
              <span className="text-slate-600">Bulk Order Requirement</span>
              <span className={minimumReached ? "text-emerald-600" : "text-[#0066FF]"}>
                {minimumReached
                  ? "Minimum completed"
                  : `${boxesNeeded} more boxes needed`}
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  minimumReached
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    : "bg-gradient-to-r from-[#0066FF] to-cyan-400"
                }`}
                style={{ width: `${Math.min((totalBoxes / 50) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[45vh] items-center justify-center">
            <div className="rounded-3xl border border-white/60 bg-white/80 px-8 py-10 text-center shadow-xl backdrop-blur-xl">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#0066FF]/20 border-t-[#0066FF]" />
              <p className="text-base font-semibold text-slate-700">
                Loading your cart...
              </p>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex min-h-[55vh] items-center justify-center">
            <div className="w-full max-w-2xl rounded-[30px] border border-white/60 bg-white/80 px-6 py-12 text-center shadow-[0_20px_60px_rgba(0,102,255,0.08)] backdrop-blur-xl">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#0066FF]/10 text-3xl text-[#0066FF]">
                <FaShoppingCart />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Your cart is empty
              </h2>
              <p className="mx-auto mt-3 max-w-md text-slate-600">
                Add your required bottles to the cart and place one combined
                bulk order with a professional checkout experience.
              </p>

              <Link
                href="/explore"
                className="mt-7 inline-flex items-center justify-center rounded-2xl bg-[#0066FF] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-[#0052cc]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
            <div className="space-y-5">
              {cart.map((item) => {
                const bottleType = getBottleType(item.name);
                const packingLine = getPackingLine(item.name, item.size);

                return (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    className="overflow-hidden rounded-[30px] border border-white/70 bg-white/85 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                  >
                    <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[180px_1fr] md:p-6">
                      <button
                        onClick={() => setSelectedProduct(item)}
                        className="group relative mx-auto w-full max-w-[220px] overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-[#eef6ff] md:mx-0 md:max-w-none"
                      >
                        <div className="flex h-[200px] items-center justify-center p-4">
                          <Image
                            src={item.img}
                            alt={item.name}
                            width={170}
                            height={170}
                            className="object-contain transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      </button>

                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                                {item.name}
                              </h2>

                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-full border border-[#0066FF]/15 bg-[#0066FF]/8 px-3 py-1 text-xs font-semibold text-[#0066FF]">
                                  {item.size}
                                </span>
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                  {bottleType}
                                </span>
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  {item.status || "In Cart"}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => removeItem(item.productId)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              <FaTrashAlt />
                              Remove
                            </button>
                          </div>

                          <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                                <FaBoxOpen className="text-[#0066FF]" />
                                Packing Details
                              </p>

                              <div className="space-y-2 text-sm text-slate-600">
                                <div className="rounded-2xl border border-white bg-white px-3 py-2">
                                  {packingLine}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-3xl border border-[#0066FF]/15 bg-gradient-to-br from-[#f8fbff] to-[#eef6ff] p-4">
                              <p className="mb-3 text-sm font-bold text-slate-800">
                                Quantity Control
                              </p>

                              <div className="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                                <button
                                  onClick={() => decreaseQty(item)}
                                  disabled={item.qty <= 1}
                                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-[#0066FF] hover:text-[#0066FF] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <FaMinus />
                                </button>

                                <div className="min-w-[72px] text-center">
                                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Boxes
                                  </p>
                                  <p className="text-2xl font-bold text-slate-900">
                                    {item.qty}
                                  </p>
                                </div>

                                <button
                                  onClick={() => increaseQty(item)}
                                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-[#0066FF] hover:text-[#0066FF]"
                                >
                                  <FaPlus />
                                </button>
                              </div>

                              <button
                                onClick={() => setSelectedProduct(item)}
                                className="mt-3 w-full rounded-2xl border border-[#0066FF]/15 bg-white px-4 py-3 text-sm font-semibold text-[#0066FF] transition hover:bg-[#0066FF]/5"
                              >
                                View Product
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="h-fit xl:sticky xl:top-6">
              <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(0,102,255,0.08)] backdrop-blur-xl">
                <div className="border-b border-slate-100 bg-gradient-to-r from-[#0066FF] to-[#00b7ff] p-5 text-white">
                  <h3 className="text-xl font-bold">Order Summary</h3>
                  <p className="mt-1 text-sm text-white/90">
                    Bulk order checkout for all cart products
                  </p>
                </div>

                <div className="space-y-5 p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Products
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {totalProducts}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#0066FF]/15 bg-[#0066FF]/5 p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#0066FF]">
                        Total Boxes
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#0066FF]">
                        {totalBoxes}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`rounded-3xl border p-4 ${
                      minimumReached
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 text-lg ${
                          minimumReached ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        <FaCheckCircle />
                      </div>
                      <div>
                        <p
                          className={`font-bold ${
                            minimumReached
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          {minimumReached
                            ? "You can place this bulk order"
                            : "Minimum order not reached yet"}
                        </p>
                        <p
                          className={`mt-1 text-sm ${
                            minimumReached
                              ? "text-emerald-700/80"
                              : "text-amber-700/80"
                          }`}
                        >
                          {minimumReached
                            ? "Your cart meets the minimum 50 boxes rule."
                            : `Add ${boxesNeeded} more boxes to continue bulk checkout.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBuyAll}
                    disabled={!minimumReached || checkoutLoading}
                    className="w-full rounded-2xl bg-[#0066FF] px-5 py-4 text-base font-bold text-white shadow-lg transition hover:scale-[1.01] hover:bg-[#0052cc] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {checkoutLoading ? "Processing..." : "Proceed to Buy All"}
                  </button>

                  <Link
                    href="/explore"
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Add More Bottles
                  </Link>

                  <p className="text-center text-xs leading-5 text-slate-500">
                    This checkout is designed for combined bottle ordering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-md"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2">
                <div className="flex items-center justify-center bg-gradient-to-br from-[#eef6ff] via-white to-[#f5fbff] p-6 md:p-8">
                  <Image
                    src={selectedProduct.img}
                    alt={selectedProduct.name}
                    width={320}
                    height={320}
                    className="object-contain"
                  />
                </div>

                <div className="p-6 md:p-8">
                  <div className="mb-3 inline-flex rounded-full border border-[#0066FF]/15 bg-[#0066FF]/8 px-3 py-1 text-xs font-semibold text-[#0066FF]">
                    Product Preview
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                    {selectedProduct.name}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                      {selectedProduct.size}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                      {selectedProduct.qty} Boxes
                    </span>
                  </div>

                  <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-bold text-slate-800">
                      Packing Details
                    </p>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="rounded-2xl border border-white bg-white px-3 py-2">
                        {getPackingLine(selectedProduct.name, selectedProduct.size)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Close
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        handleBuyAll();
                      }}
                      className="flex-1 rounded-2xl bg-[#0066FF] px-4 py-3 font-semibold text-white transition hover:bg-[#0052cc]"
                    >
                      Buy All from Cart
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}