"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaEnvelope,
  FaBox,
  FaMagic,
} from "react-icons/fa";

type Props = {
  product: string;
  defaultSize: string;
  type: string;
  img?: string;
};

export default function OrderForm({
  product,
  defaultSize,
  type,
  img,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    size: defaultSize || "1L",
    boxes: 50,
    payment: "COD",
    notes: "",
  });

  const inputStyle =
    "w-full p-3 rounded-xl border border-blue-100 bg-white/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#0066FF] transition text-sm";

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      return "Enter valid 10-digit phone";
    }
    if (!form.address.trim()) return "Address is required";
    if (form.boxes < 50) return "Minimum 50 boxes required";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          product,
          type,
        }),
      });

      const data = await res.json();
      console.log("ORDER RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Order failed");
      }

      const createdOrderId = data?.orderId || data?.order?.orderId;

      if (!createdOrderId) {
        throw new Error("Order ID not received from server");
      }

      router.push(`/order/success/${createdOrderId}`);
    } catch (err: any) {
      console.error("ORDER SUBMIT ERROR:", err);
      alert(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-5 text-gray-800 tracking-wide">
        Place Order
      </h2>

      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
        <div className="flex items-center gap-3">
          {img && (
            <img
              src={img}
              alt={product}
              className="h-14 w-14 object-contain rounded-lg"
            />
          )}
          <div>
            <p className="text-sm text-gray-700">
              <strong>{product}</strong>
            </p>
            <p className="text-xs text-gray-500">{type}</p>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => router.push("/customize")}
        className="mb-6 w-full flex items-center justify-center gap-2 
        py-3 rounded-xl 
        bg-gradient-to-r from-[#0066FF] to-blue-500 
        text-white font-semibold shadow-lg hover:shadow-blue-300/50 transition"
      >
        <FaMagic />
        Customize Bottle (Optional)
      </motion.button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 col-span-2">
          <FaUser className="text-gray-500" />
          <input
            placeholder="Full Name *"
            className={inputStyle}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-3 col-span-2">
          <FaEnvelope className="text-gray-500" />
          <input
            placeholder="Email"
            className={inputStyle}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-3 col-span-2">
          <FaPhone className="text-gray-500" />
          <input
            placeholder="Phone Number *"
            className={inputStyle}
            value={form.phone}
            maxLength={10}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
          />
        </div>

        <div className="flex items-center gap-3 col-span-2">
          <FaMapMarkerAlt className="text-gray-500" />
          <input
            placeholder="Address *"
            className={inputStyle}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <input
          placeholder="City"
          className={inputStyle}
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <input
          placeholder="State"
          className={inputStyle}
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        />

        <input
          placeholder="Pincode"
          className={inputStyle}
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
        />

        <div className="flex items-center gap-3">
          <FaBox className="text-gray-500" />
          <input
            type="number"
            min={50}
            placeholder="Boxes (Min 50)"
            className={inputStyle}
            value={form.boxes}
            onChange={(e) => setForm({ ...form, boxes: Number(e.target.value) })}
          />
        </div>

        <div className="flex items-center gap-3">
          <FaCreditCard className="text-gray-500" />
          <select
            value={form.payment}
            className={inputStyle}
            onChange={(e) => setForm({ ...form, payment: e.target.value })}
          >
            <option>COD</option>
            <option>Online</option>
            <option>Bank Transfer</option>
          </select>
        </div>

        <textarea
          placeholder="Special Instructions"
          className={`${inputStyle} col-span-2`}
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          disabled={loading}
          onClick={handleSubmit}
          className={`col-span-2 w-full py-3 rounded-xl text-white font-semibold tracking-wide
          bg-gradient-to-r from-[#0066FF] to-blue-500
          hover:from-blue-600 hover:to-[#0066FF]
          shadow-lg hover:shadow-blue-300/50 transition-all
          ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? "Processing..." : "🚀 Request Order"}
        </motion.button>
      </div>
    </div>
  );
}