"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaShoppingBag,
  FaTruck,
  FaUser,
} from "react-icons/fa";

interface CartItem {
  productId: number;
  name: string;
  img: string;
  size: string;
  qty: number;
  status?: string;
}

interface AlternateAddress {
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface CheckoutCustomer {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  alternatePhoneNumbers?: string[];
  alternateAddresses?: AlternateAddress[];
}

interface CheckoutData {
  items: CartItem[];
  totalBoxes: number;
  customer?: CheckoutCustomer;
  checkoutType?: string;
}

interface ItemTrackingInfo {
  product: string;
  size: string;
  boxes: number;
  itemTrackingId: string;
  status?: string;
}

interface BulkOrderSuccess {
  mainOrderId: string;
  items: ItemTrackingInfo[];
}

function formatFullAddress(address: {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) {
  return [address.address, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
}

export default function CartCheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [error, setError] = useState("");

  const [bulkOrderResult, setBulkOrderResult] = useState<BulkOrderSuccess | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    primaryPhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [extraPhones, setExtraPhones] = useState<string[]>([]);
  const [selectedPhone, setSelectedPhone] = useState("");

  const [extraAddresses, setExtraAddresses] = useState<AlternateAddress[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  useEffect(() => {
    try {
      const rawData = localStorage.getItem("cartCheckoutData");

      if (!rawData) {
        setLoading(false);
        return;
      }

      const parsedData: CheckoutData = JSON.parse(rawData);
      setItems(Array.isArray(parsedData?.items) ? parsedData.items : []);

      const customer = parsedData?.customer || {};
      const primaryPhone = customer.phone || "";
      const alternatePhoneNumbers = Array.isArray(customer.alternatePhoneNumbers)
        ? customer.alternatePhoneNumbers
        : [];

      const basePrimaryAddress: AlternateAddress = {
        label: "Primary Address",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        pincode: customer.pincode || "",
      };

      const alternateAddresses = Array.isArray(customer.alternateAddresses)
        ? customer.alternateAddresses
        : [];

      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        primaryPhone,
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        pincode: customer.pincode || "",
      });

      setSelectedPhone(primaryPhone);
      setExtraPhones(alternatePhoneNumbers.filter(Boolean));
      setExtraAddresses([basePrimaryAddress, ...alternateAddresses]);
      setSelectedAddressIndex(0);
    } catch (err) {
      console.error("Checkout data load error:", err);
      setError("Unable to load checkout details.");
    } finally {
      setLoading(false);
    }
  }, []);

  const totalBoxes = useMemo(() => {
    return items.reduce((acc, item) => acc + item.qty, 0);
  }, [items]);

  const totalProducts = useMemo(() => items.length, [items]);

  const minimumReached = totalBoxes >= 50;
  const boxesNeeded = Math.max(0, 50 - totalBoxes);

  const allAddresses = useMemo(() => {
    const primaryAddress: AlternateAddress = {
      label: "Primary Address",
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
    };

    const remaining = extraAddresses.slice(1);
    return [primaryAddress, ...remaining];
  }, [
    formData.address,
    formData.city,
    formData.state,
    formData.pincode,
    extraAddresses,
  ]);

  const selectedAddress =
    allAddresses[selectedAddressIndex] || allAddresses[0] || null;

  const formattedSelectedAddress = useMemo(() => {
    if (!selectedAddress) return "";
    return formatFullAddress(selectedAddress);
  }, [selectedAddress]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAnotherPhone = () => {
    setExtraPhones((prev) => [...prev, ""]);
  };

  const updateExtraPhone = (index: number, value: string) => {
    const oldPhone = extraPhones[index];

    setExtraPhones((prev) =>
      prev.map((phone, i) => (i === index ? value : phone))
    );

    if (selectedPhone === oldPhone) {
      setSelectedPhone(value);
    }
  };

  const removeExtraPhone = (index: number) => {
    const phoneToRemove = extraPhones[index];

    setExtraPhones((prev) => prev.filter((_, i) => i !== index));

    if (selectedPhone === phoneToRemove) {
      setSelectedPhone(formData.primaryPhone);
    }
  };

  const addAnotherAddress = () => {
    setExtraAddresses((prev) => [
      ...prev,
      {
        label: `Address ${prev.length + 1}`,
        address: "",
        city: "",
        state: "",
        pincode: "",
      },
    ]);
  };

  const updateExtraAddress = (
    index: number,
    field: keyof AlternateAddress,
    value: string
  ) => {
    setExtraAddresses((prev) =>
      prev.map((address, i) =>
        i === index ? { ...address, [field]: value } : address
      )
    );
  };

  const removeExtraAddress = (index: number) => {
    if (index === 0) return;

    setExtraAddresses((prev) => prev.filter((_, i) => i !== index));

    if (selectedAddressIndex === index) {
      setSelectedAddressIndex(0);
    } else if (selectedAddressIndex > index) {
      setSelectedAddressIndex((prev) => prev - 1);
    }
  };

  const clearCartAfterSuccess = async () => {
    try {
      await Promise.all(
        items.map((item) =>
          fetch("/api/cart", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: item.productId,
            }),
          })
        )
      );
    } catch (err) {
      console.error("Cart clear error:", err);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (!selectedPhone.trim()) return "Phone number is required.";
    if (!selectedAddress?.address?.trim()) return "Address is required.";
    if (!selectedAddress?.city?.trim()) return "City is required.";
    if (!selectedAddress?.state?.trim()) return "State is required.";
    if (!selectedAddress?.pincode?.trim()) return "Pincode is required.";
    if (!minimumReached) {
      return `Minimum 50 boxes required. Add ${boxesNeeded} more boxes.`;
    }
    if (!items.length) return "No cart items found.";
    return "";
  };

  const handlePlaceBulkOrder = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      const payload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: selectedPhone,
          address: selectedAddress?.address || "",
          city: selectedAddress?.city || "",
          state: selectedAddress?.state || "",
          pincode: selectedAddress?.pincode || "",
        },
        totalBoxes,
        totalProducts,
        source: "cart-checkout",
        items: items.map((item) => ({
          productId: item.productId,
          product: item.name,
          size: item.size,
          boxes: item.qty,
          img: item.img,
        })),
      };

      const res = await fetch("/api/orders/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to place bulk order.");
      }

      const resolvedMainOrderId =
        data?.order?.mainOrderId ||
        data?.mainOrderId ||
        data?.order?.parentOrderId ||
        data?.parentOrderId ||
        data?.orderId ||
        "";

      const resolvedItems =
        data?.order?.items ||
        data?.items ||
        items.map((item, index) => ({
          product: item.name,
          size: item.size,
          boxes: item.qty,
          itemTrackingId: `${resolvedMainOrderId || "ORD"}-${index + 1}`,
          status: "Pending Approval",
        }));

      setBulkOrderResult({
        mainOrderId: resolvedMainOrderId,
        items: resolvedItems,
      });

      await clearCartAfterSuccess();
      localStorage.removeItem("cartCheckoutData");

      setCheckoutComplete(true);
      setItems([]);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to place bulk order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <main className="m-0 min-h-screen bg-[#f7f8fa] p-0">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white px-8 py-12 text-center shadow-sm">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#0066FF]/20 border-t-[#0066FF]" />
            <h2 className="text-xl font-bold text-slate-900">
              Loading checkout...
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Preparing your order review page.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (checkoutComplete) {
    return (
      <main className="m-0 min-h-screen bg-[#f7f8fa] p-0">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 bg-emerald-50 px-6 py-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">
                  <FaCheckCircle />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-emerald-700">
                    Your bulk order has been placed
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    One common bulk order has been created, and each product has
                    its own tracking ID.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="rounded-2xl border border-[#0066FF]/20 bg-[#0066FF]/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
                  Main Order ID
                </p>
                <p className="mt-2 break-all text-2xl font-bold text-slate-900">
                  {bulkOrderResult?.mainOrderId || "N/A"}
                </p>
              </div>

              <div className="space-y-4">
                {bulkOrderResult?.items?.map((item, index) => (
                  <div
                    key={`${item.itemTrackingId}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {item.product}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.size} • {item.boxes} Boxes
                        </p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Item Tracking ID
                        </p>
                        <p className="mt-1 break-all text-base font-bold text-[#0066FF]">
                          {item.itemTrackingId}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                          Status
                        </p>
                        <p className="mt-1 text-sm font-bold text-emerald-700">
                          {item.status || "Pending Approval"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 pt-2 md:grid-cols-3">
                <Link
                  href="/orderHistory"
                  className="rounded-xl bg-[#0066FF] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#0052cc]"
                >
                  View Order History
                </Link>
                <Link
                  href="/track"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Track Orders
                </Link>
                <Link
                  href="/explore"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="m-0 min-h-screen bg-[#f7f8fa] p-0">
        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-10">
          <div className="w-full rounded-3xl border border-slate-200 bg-white px-8 py-14 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#0066FF]/10 text-3xl text-[#0066FF]">
              <FaShoppingBag />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              No checkout data found
            </h1>
            <p className="mx-auto mt-3 max-w-md text-slate-600">
              Your checkout session is empty. Please add products to your cart
              first.
            </p>
            <Link
              href="/cart"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#0066FF] px-6 py-3 font-semibold text-white transition hover:bg-[#0052cc]"
            >
              Go to Cart
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="m-0 min-h-screen bg-[#f7f8fa] p-0 text-slate-800">
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-4">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:underline"
          >
            <FaArrowLeft />
            Back to cart
          </Link>
        </div>

        {!!error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.7fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-[1.7rem] font-bold text-slate-900">
                    Delivering to {formData.name || "Customer"}
                  </h2>

                  <p className="mt-2 max-w-3xl text-base text-slate-700">
                    {formattedSelectedAddress || "Address not added yet"}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {selectedPhone || "Phone not added"}
                    {formData.email ? ` • ${formData.email}` : ""}
                  </p>
                </div>

                <a
                  href="#delivery-details"
                  className="shrink-0 text-sm font-medium text-[#0066FF] hover:underline"
                >
                  Change
                </a>
              </div>
            </div>

            <div
              id="delivery-details"
              className="rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-2xl font-bold text-slate-900">
                  Delivery details
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Saved profile details are auto-filled here. You can add more
                  phone numbers and addresses.
                </p>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FaUser className="text-[#0066FF]" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FaUser className="text-[#0066FF]" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <FaPhoneAlt className="text-[#0066FF]" />
                        Phone numbers
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Select the number you want to use for this order.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addAnotherPhone}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#0066FF]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0066FF] transition hover:bg-[#0066FF]/5"
                    >
                      <FaPlus />
                      Add another phone number
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                      <input
                        type="radio"
                        name="selectedPhone"
                        checked={selectedPhone === formData.primaryPhone}
                        onChange={() => setSelectedPhone(formData.primaryPhone)}
                        className="mt-1 h-4 w-4 accent-[#0066FF]"
                      />
                      <div className="w-full">
                        <p className="mb-2 text-sm font-semibold text-slate-800">
                          Primary Phone
                        </p>
                        <input
                          type="text"
                          name="primaryPhone"
                          value={formData.primaryPhone}
                          onChange={(e) => {
                            const oldPhone = formData.primaryPhone;
                            handleChange(e);
                            if (selectedPhone === oldPhone) {
                              setSelectedPhone(e.target.value);
                            }
                          }}
                          placeholder="Enter primary phone number"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                        />
                      </div>
                    </label>

                    {extraPhones.map((phone, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="selectedPhone"
                            checked={selectedPhone === phone}
                            onChange={() => setSelectedPhone(phone)}
                            className="mt-1 h-4 w-4 accent-[#0066FF]"
                          />

                          <div className="w-full">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-800">
                                Additional Phone {index + 1}
                              </p>

                              <button
                                type="button"
                                onClick={() => removeExtraPhone(index)}
                                className="text-sm font-medium text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            </div>

                            <input
                              type="text"
                              value={phone}
                              onChange={(e) =>
                                updateExtraPhone(index, e.target.value)
                              }
                              placeholder="Enter another phone number"
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <FaMapMarkerAlt className="text-[#0066FF]" />
                        Delivery addresses
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Select the address you want to use for this order.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addAnotherAddress}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#0066FF]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0066FF] transition hover:bg-[#0066FF]/5"
                    >
                      <FaPlus />
                      Add another address
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressIndex === 0}
                          onChange={() => setSelectedAddressIndex(0)}
                          className="mt-1 h-4 w-4 accent-[#0066FF]"
                        />

                        <div className="w-full">
                          <p className="mb-3 text-sm font-semibold text-slate-800">
                            Primary Address
                          </p>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <FaTruck className="text-[#0066FF]" />
                                Full Address
                              </label>
                              <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter complete address"
                                rows={4}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                              />
                            </div>

                            <div>
                              <label className="mb-2 text-sm font-semibold text-slate-700">
                                City
                              </label>
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Enter city"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                              />
                            </div>

                            <div>
                              <label className="mb-2 text-sm font-semibold text-slate-700">
                                State
                              </label>
                              <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="Enter state"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                              />
                            </div>

                            <div>
                              <label className="mb-2 text-sm font-semibold text-slate-700">
                                Pincode
                              </label>
                              <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="Enter pincode"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {allAddresses.slice(1).map((address, index) => {
                      const actualIndex = index + 1;

                      return (
                        <div
                          key={actualIndex}
                          className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={selectedAddressIndex === actualIndex}
                              onChange={() =>
                                setSelectedAddressIndex(actualIndex)
                              }
                              className="mt-1 h-4 w-4 accent-[#0066FF]"
                            />

                            <div className="w-full">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <input
                                  type="text"
                                  value={address.label}
                                  onChange={(e) =>
                                    updateExtraAddress(
                                      actualIndex,
                                      "label",
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Address ${actualIndex}`}
                                  className="max-w-[220px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold outline-none focus:border-[#0066FF]"
                                />

                                <button
                                  type="button"
                                  onClick={() => removeExtraAddress(actualIndex)}
                                  className="text-sm font-medium text-red-600 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                  <textarea
                                    value={address.address}
                                    onChange={(e) =>
                                      updateExtraAddress(
                                        actualIndex,
                                        "address",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter full address"
                                    rows={4}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                                  />
                                </div>

                                <div>
                                  <input
                                    type="text"
                                    value={address.city}
                                    onChange={(e) =>
                                      updateExtraAddress(
                                        actualIndex,
                                        "city",
                                        e.target.value
                                      )
                                    }
                                    placeholder="City"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                                  />
                                </div>

                                <div>
                                  <input
                                    type="text"
                                    value={address.state}
                                    onChange={(e) =>
                                      updateExtraAddress(
                                        actualIndex,
                                        "state",
                                        e.target.value
                                      )
                                    }
                                    placeholder="State"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                                  />
                                </div>

                                <div>
                                  <input
                                    type="text"
                                    value={address.pincode}
                                    onChange={(e) =>
                                      updateExtraAddress(
                                        actualIndex,
                                        "pincode",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Pincode"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#0066FF]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-fit xl:sticky xl:top-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <button
                onClick={handlePlaceBulkOrder}
                disabled={placingOrder || !minimumReached}
                className="w-full rounded-full bg-[#ffd814] px-5 py-3 text-base font-medium text-slate-900 transition hover:bg-[#f7ca00] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {placingOrder ? "Placing Bulk Order..." : "Create Bulk Order"}
              </button>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Products:</span>
                    <span>{totalProducts}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Total Boxes:</span>
                    <span>{totalBoxes}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Selected Phone:</span>
                    <span className="max-w-[150px] truncate text-right">
                      {selectedPhone || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Order Type:</span>
                    <span className="text-[#0066FF]">Single Bulk Order</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Minimum Rule:</span>
                    <span
                      className={
                        minimumReached ? "text-emerald-600" : "text-amber-600"
                      }
                    >
                      {minimumReached ? "Completed" : `${boxesNeeded} left`}
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                            minimumReached ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {minimumReached
                            ? "Ready to create bulk order"
                            : "Minimum boxes not completed"}
                        </p>
                        <p
                          className={`mt-1 text-sm ${
                            minimumReached
                              ? "text-emerald-700/80"
                              : "text-amber-700/80"
                          }`}
                        >
                          {minimumReached
                            ? "One common order ID will be generated for all items."
                            : `Add ${boxesNeeded} more boxes in cart to continue.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-2 text-sm font-bold text-slate-900">
                    Delivery Preview
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-800">Name:</span>{" "}
                      {formData.name || "Not filled"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Phone:</span>{" "}
                      {selectedPhone || "Not filled"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Email:</span>{" "}
                      {formData.email || "Not filled"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">
                        Address:
                      </span>{" "}
                      {formattedSelectedAddress || "Not filled"}
                    </p>
                  </div>
                </div>

                <h3 className="mt-5 text-[2rem] font-bold text-slate-900">
                  Order Total:
                </h3>
                <p className="mt-1 text-lg font-semibold text-[#0066FF]">
                  {totalBoxes} Boxes
                </p>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  This checkout now sends one combined order with one main order
                  ID and separate tracking IDs for each product item.
                </p>

                <Link
                  href="/cart"
                  className="mt-5 block text-sm font-medium text-[#0066FF] hover:underline"
                >
                  Back to cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}