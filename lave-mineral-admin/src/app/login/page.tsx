"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        callbackUrl: "/orderHistory",
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      if (res?.ok) {
        router.push("/orderHistory");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
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
          Admin Login
        </h2>

        <p className="mt-1 mb-5 text-center text-sm text-gray-600">
          Secure access to admin dashboard 🔐
        </p>

        {error && (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 py-2 text-center text-sm text-red-500">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-2xl border border-gray-300 bg-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="relative mb-5">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          onClick={handleLogin}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 py-3 font-semibold text-white transition hover:scale-[1.01] hover:shadow-lg disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Admin Access Only 🔐
        </p>

        <p className="mt-3 text-center text-sm text-gray-600">
          Don&apos;t have an admin account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}