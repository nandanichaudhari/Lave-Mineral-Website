"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("admin-session");
        window.dispatchEvent(new Event("auth-mode-changed"));
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.ok) {
        const callbackUrl = searchParams.get("callbackUrl");
        router.push(callbackUrl || "/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#cfd9df] to-[#e2ebf0] px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl"
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-center py-3 rounded-full font-semibold mb-6">
          💧 LAVE MINERAL
        </div>

        <h2 className="text-center text-lg font-medium text-gray-800">
          Welcome Back
        </h2>

        <p className="text-center text-sm text-gray-600 mb-5">
          Pure Water, Pure Life 💧
        </p>

        {error && (
          <p className="text-center text-sm text-red-500 mb-3">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="relative mb-5">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <span
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            {show ? "🙈" : "👁️"}
          </span>
        </div>

        <button
          disabled={loading}
          onClick={handleLogin}
          className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => router.push("/auth/signup")}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </motion.div>
    </div>
  );
}