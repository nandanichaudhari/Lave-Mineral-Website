"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminSignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    setMsg("");

    if (!form.name || !form.email || !form.password) {
      setMsg("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Signup failed");
        return;
      }

      setMsg("Admin created successfully ✅");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#cfd9df] via-[#e2ebf0] to-[#f8fbff] px-4">
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_20px_60px_rgba(0,102,255,0.18)] backdrop-blur-xl"
      >
        <div className="mb-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 py-3 text-center font-semibold text-white shadow-md">
          💧 LAVE MINERAL
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-800">
          Admin Sign Up
        </h2>

        <p className="mt-1 mb-5 text-center text-sm text-gray-600">
          Create secure admin account 🔐
        </p>

        {msg && (
          <p
            className={`mb-4 rounded-xl py-2 text-center text-sm ${
              msg.includes("successfully")
                ? "border border-green-100 bg-green-50 text-green-600"
                : "border border-red-100 bg-red-50 text-red-500"
            }`}
          >
            {msg}
          </p>
        )}

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="mb-4 w-full rounded-2xl border border-gray-300 bg-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          className="mb-4 w-full rounded-2xl border border-gray-300 bg-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="relative mb-5">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            className="w-full rounded-2xl border border-gray-300 bg-white/90 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
          >
            {show ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 py-3 font-semibold text-white transition hover:scale-[1.01] hover:shadow-lg disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create Admin Account"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an admin account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}