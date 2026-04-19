"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaBox,
  FaMagic,
  FaPlus,
  FaLocationArrow,
  FaRegCheckCircle,
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
  const [locationLoading, setLocationLoading] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    boxes: 50,
    notes: "",
  });

  const [savedAddress, setSavedAddress] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        const user = data?.user;

        if (!user) return;

        const profileAddress = user.address || "";

        setSavedAddress(profileAddress);

        setForm((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: profileAddress,
        }));
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, []);

  const inputStyle =
    "w-full rounded-2xl border border-[#d9e5f3] bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-[#7aa7d9] focus:ring-4 focus:ring-[#7aa7d9]/10";

  const iconWrap =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e6edf5] bg-[#f7fafc] text-[#5f88b8] shadow-sm";

  const cardStyle =
    "rounded-[26px] border border-white/70 bg-white/75 shadow-[0_16px_45px_rgba(31,78,121,0.08)] backdrop-blur-xl";

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      return "Enter valid 10-digit phone number";
    }
    if (!form.address.trim()) return "Address is required";
    if (form.boxes < 50) return "Minimum 50 boxes required";
    return null;
  };

  const handleUseAnotherAddress = () => {
    setUseSavedAddress(false);
    setForm((prev) => ({
      ...prev,
      address: "",
    }));
  };

  const handleUseSavedAddress = () => {
    setUseSavedAddress(true);
    setForm((prev) => ({
      ...prev,
      address: savedAddress,
    }));
  };

  const handleAddLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);

        const liveLocationText = `Live Location: https://maps.google.com/?q=${latitude},${longitude}`;

        setForm((prev) => {
          const trimmed = prev.address.trim();

          return {
            ...prev,
            address: trimmed
              ? `${trimmed}\n${liveLocationText}`
              : liveLocationText,
          };
        });

        setLocationLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          alert("Location permission denied. Please allow location access.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert("Location information is unavailable.");
        } else if (error.code === error.TIMEOUT) {
          alert("Location request timed out.");
        } else {
          alert("Unable to fetch live location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
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
          size: defaultSize || "1L",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Order failed");
      }

      const id = data?.orderId || data?.order?.orderId;

      if (!id) {
        throw new Error("Order ID not received from server");
      }

      router.push(`/order/success/${id}`);
    } catch (err: any) {
      console.error("ORDER SUBMIT ERROR:", err);
      alert(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Soft Premium Header */}
      <div
        className={`mb-6 overflow-hidden p-5 sm:p-6 ${cardStyle}`}
      >
        <div className="flex items-start gap-4">
          {img ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#edf2f7] bg-gradient-to-br from-[#f8fbff] to-[#eef4f8] p-2 shadow-sm">
              <img
                src={img}
                alt={product}
                className="h-full w-full rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#edf2f7] bg-gradient-to-br from-[#f8fbff] to-[#eef4f8] text-[#6b8fb8] shadow-sm">
              <FaBox />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8da1]">
              Placing Order For
            </p>

            <h2 className="mt-1 text-2xl font-bold leading-tight text-[#24415f]">
              {product}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#dfe8f2] bg-[#f8fbfd] px-3 py-1 text-xs font-medium text-[#5d748c]">
                {type}
              </span>

              <span className="rounded-full border border-[#dfe8f2] bg-[#f8fbfd] px-3 py-1 text-xs font-medium text-[#5d748c]">
                Size: {defaultSize}
              </span>

              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Min 50 Boxes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => router.push("/customize")}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#dbe6f0] bg-white py-3.5 text-sm font-semibold text-[#35597d] shadow-sm transition hover:border-[#c7d8e8] hover:bg-[#f8fbff]"
      >
        <FaMagic className="text-[#5f88b8]" />
        Customize Bottle (Optional)
      </motion.button>

      <div className="grid gap-5">
        {/* Name */}
        <div className="flex items-center gap-3">
          <div className={iconWrap}>
            <FaUser />
          </div>
          <input
            placeholder="Full Name *"
            className={inputStyle}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="flex items-center gap-3">
          <div className={iconWrap}>
            <FaEnvelope />
          </div>
          <input
            placeholder="Email"
            className={inputStyle}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3">
          <div className={iconWrap}>
            <FaPhone />
          </div>
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

        {/* Quantity before Address */}
        <div className="flex items-center gap-3">
          <div className={iconWrap}>
            <FaBox />
          </div>
          <input
            type="number"
            min={50}
            placeholder="Boxes Quantity (Min 50) *"
            className={inputStyle}
            value={form.boxes}
            onChange={(e) =>
              setForm({ ...form, boxes: Number(e.target.value) })
            }
          />
        </div>

        {/* Address Section */}
        <div className={`${cardStyle} p-4 sm:p-5`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2f4f6f]">
                Delivery Address
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Saved address is selected by default. You can switch anytime.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUseSavedAddress}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
                  useSavedAddress
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-[#dbe6f0] bg-white text-[#4d6782]"
                }`}
              >
                <FaRegCheckCircle />
                Use Saved Address
              </button>

              <button
                type="button"
                onClick={handleUseAnotherAddress}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
                  !useSavedAddress
                    ? "border border-[#cfe0f0] bg-[#f4f9ff] text-[#35597d]"
                    : "border border-[#dbe6f0] bg-white text-[#4d6782]"
                }`}
              >
                <FaPlus />
                Use Another Address
              </button>
            </div>
          </div>

          <div className="mb-3 flex items-start gap-3">
            <div className={`${iconWrap} mt-1`}>
              <FaMapMarkerAlt />
            </div>

            <textarea
              placeholder="Full Address (House, Area, Landmark, City, State, Pincode)"
              className={`${inputStyle} min-h-[120px] resize-none`}
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddLiveLocation}
              disabled={locationLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d7e4ef] bg-[#f8fbff] px-4 py-2.5 text-sm font-medium text-[#35597d] shadow-sm transition hover:bg-[#eef6ff] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaLocationArrow className="text-[#5f88b8]" />
              {locationLoading ? "Adding Location..." : "Add Live Location"}
            </button>
          </div>
        </div>

        {/* Notes */}
        <textarea
          placeholder="Special Instructions"
          className={`${inputStyle} min-h-[100px] resize-none`}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.01 }}
          disabled={loading}
          onClick={handleSubmit}
          className="w-full rounded-2xl bg-gradient-to-r from-[#5f88b8] to-[#7ca8d1] py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(95,136,184,0.25)] transition hover:from-[#567ea9] hover:to-[#739dc5] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Processing..." : "Place Order"}
        </motion.button>
      </div>
    </div>
  );
}