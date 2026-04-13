"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  FaUser,
  FaClipboardList,
  FaBoxOpen,
  FaTruck,
  FaHome,
  FaCommentDots,
  FaPalette,
  FaShoppingCart,
} from "react-icons/fa";

export default function AdminNavbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const updateHash = () => {
      if (typeof window !== "undefined") {
        setCurrentHash(window.location.hash);
      }
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  if (status === "loading") return null;
  if (!session) return null;

  const isActive = (path: string) => {
    if (path === "/#feedback") {
      return pathname === "/" && currentHash === "#feedback";
    }

    if (path === "/") {
      return pathname === "/" && currentHash !== "#feedback";
    }

    return pathname === path;
  };

  const navItemClass = (active: boolean) =>
    `group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
      active
        ? "border border-[#0066ff]/15 bg-[#0066ff]/10 text-[#0066ff] shadow-[0_10px_24px_rgba(0,102,255,0.12)]"
        : "border border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900"
    }`;

  const iconClass = (active: boolean) =>
    active ? "text-[#0066ff]" : "text-slate-500";

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed left-0 top-0 z-50 w-full border-b border-white/70 bg-white/90 backdrop-blur-2xl shadow-[0_10px_35px_rgba(33,72,140,0.08)]"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[78px] items-center justify-between gap-4">
          {/* Left: Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_8px_24px_rgba(0,102,255,0.10)] sm:h-12 sm:w-12">
              <Image
                src="/images/logo2.png"
                alt="Lave Mineral"
                fill
                className="object-contain p-1.5"
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-[#0066ff]">
                LAVE MINERAL
              </h1>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:text-xs">
                Admin Panel
              </p>
            </div>
          </Link>

          {/* Right: Desktop Nav */}
          <div className="hidden items-center gap-2 xl:flex">
            <Link href="/" className={navItemClass(isActive("/"))}>
              <FaHome className={iconClass(isActive("/"))} />
              Home
            </Link>

            <Link href="/explore" className={navItemClass(isActive("/explore"))}>
              <FaBoxOpen className={iconClass(isActive("/explore"))} />
              Products
            </Link>

            <Link href="/track" className={navItemClass(isActive("/track"))}>
              <FaTruck className={iconClass(isActive("/track"))} />
              Track
            </Link>

            <Link
              href="/#feedback"
              className={navItemClass(isActive("/#feedback"))}
            >
              <FaCommentDots className={iconClass(isActive("/#feedback"))} />
              Feedback
            </Link>

            <Link
              href="/customize"
              className={navItemClass(isActive("/customize"))}
            >
              <FaPalette className={iconClass(isActive("/customize"))} />
              Custom Bottle
            </Link>

            <Link href="/cart" className={navItemClass(isActive("/cart"))}>
              <FaShoppingCart className={iconClass(isActive("/cart"))} />
              Cart
            </Link>

            <Link
              href="/orderHistory"
              className={navItemClass(isActive("/orderHistory"))}
            >
              <FaClipboardList className={iconClass(isActive("/orderHistory"))} />
              Order Detail
            </Link>

            <Link
              href="/profile"
              className={navItemClass(isActive("/profile"))}
            >
              <FaUser className={iconClass(isActive("/profile"))} />
              Admin Profile
            </Link>
          </div>
        </div>

        {/* Mobile / tablet nav */}
        <div className="flex flex-wrap items-center gap-2 pb-4 xl:hidden">
          <Link href="/" className={navItemClass(isActive("/"))}>
            <FaHome className={iconClass(isActive("/"))} />
            Home
          </Link>

          <Link href="/explore" className={navItemClass(isActive("/explore"))}>
            <FaBoxOpen className={iconClass(isActive("/explore"))} />
            Products
          </Link>

          <Link href="/track" className={navItemClass(isActive("/track"))}>
            <FaTruck className={iconClass(isActive("/track"))} />
            Track
          </Link>

          <Link
            href="/#feedback"
            className={navItemClass(isActive("/#feedback"))}
          >
            <FaCommentDots className={iconClass(isActive("/#feedback"))} />
            Feedback
          </Link>

          <Link
            href="/customize"
            className={navItemClass(isActive("/customize"))}
          >
            <FaPalette className={iconClass(isActive("/customize"))} />
            Custom
          </Link>

          <Link href="/cart" className={navItemClass(isActive("/cart"))}>
            <FaShoppingCart className={iconClass(isActive("/cart"))} />
            Cart
          </Link>

          <Link
            href="/orderHistory"
            className={navItemClass(isActive("/orderHistory"))}
          >
            <FaClipboardList className={iconClass(isActive("/orderHistory"))} />
            Order Detail
          </Link>

          <Link
            href="/profile"
            className={navItemClass(isActive("/profile"))}
          >
            <FaUser className={iconClass(isActive("/profile"))} />
            Admin Profile
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}