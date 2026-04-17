"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, getSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaTruck,
  FaClipboardList,
  FaSignInAlt,
  FaBoxOpen,
  FaHome,
  FaCommentDots,
  FaPalette,
} from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";

const navLinks = [
  { label: "Home", href: "/", icon: <FaHome /> },
  { label: "Products", href: "/explore", icon: <FaBoxOpen /> },
  { label: "Custom Bottle", href: "/customize", icon: <FaPalette /> },
  { label: "Feedback", href: "/#feedback", icon: <FaCommentDots /> },
  { label: "About Us", href: "/aboutus", icon: <FaUserCircle /> },
  { label: "Track", href: "/track", icon: <FaTruck /> },
];

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");

  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const updateCart = async () => {
      try {
        const sessionData = await getSession();

        if (!sessionData) {
          setCartCount(0);
          return;
        }

        const res = await fetch("/api/cart", { cache: "no-store" });
        const data = await res.json();

        setCartCount(
          Array.isArray(data?.cart?.items) ? data.cart.items.length : 0
        );
      } catch {
        setCartCount(0);
      }
    };

    updateCart();
    window.addEventListener("focus", updateCart);

    return () => window.removeEventListener("focus", updateCart);
  }, []);

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

  useEffect(() => {
    setOpen(false);
  }, [pathname, currentHash]);

  const isActive = (path: string) => {
    if (path === "/#feedback") {
      return pathname === "/" && currentHash === "#feedback";
    }

    if (path === "/#aboutus") {
    return pathname === "/" && currentHash === "#aboutus";
  }

  if (path === "/") {
    return pathname === "/" && currentHash !== "#feedback" && currentHash !== "#aboutus";
  }

    return pathname === path;
  };

  const navTextClass = (path: string) =>
    isActive(path)
      ? "text-[#2563ff] font-semibold"
      : "text-slate-700 hover:text-[#2563ff]";

  const mobileNavClass = (path: string) =>
    isActive(path)
      ? "bg-[#2563ff]/10 text-[#2563ff]"
      : "text-slate-700 hover:bg-slate-50 hover:text-[#2563ff]";

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed left-0 top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md"
      >
        <div className="mx-auto flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Brand */}
          <div className="flex min-w-0 flex-shrink-0 items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Lave Mineral Logo"
                width={44}
                height={44}
                className="rounded-full bg-white p-1 object-contain"
              />
              <div className="leading-tight">
                <h1 className="text-base font-extrabold tracking-wide text-[#0d3b66] sm:text-lg md:text-xl">
                  LAVE MINERAL
                </h1>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#2563ff] sm:text-xs">
                  Pure water brand
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Desktop Nav */}
          <div className="hidden flex-1 items-center justify-end gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition ${navTextClass(
                  link.href
                )}`}
              >
                <span className="text-[15px]">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {session?.user?.role === "user" && (
              <Link
                href="/orderHistory"
                className={`flex items-center gap-2 text-sm font-medium transition ${navTextClass(
                  "/orderHistory"
                )}`}
              >
                <FaClipboardList />
                Order History
              </Link>
            )}

            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-full border border-[#2563ff]/15 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-[#f4f8ff] hover:shadow-[0_8px_20px_rgba(37,99,255,0.10)]"
            >
              <HiOutlineShoppingBag className="text-[18px] text-[#2563ff]" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-[#2563ff] px-1.5 py-[2px] text-center text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {session?.user?.role === "user" && (
              <Link
                href="/profile"
                className={`flex items-center gap-2 text-sm font-medium transition ${navTextClass(
                  "/profile"
                )}`}
              >
                <FaUserCircle />
                Profile
              </Link>
            )}

            {status === "loading" ? (
              <div className="h-11 w-28 animate-pulse rounded-full bg-slate-200" />
            ) : !session ? (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#2563ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f55db]"
              >
                <FaSignInAlt />
                Login / Sign Up
              </Link>
            ) : null}
          </div>

          {/* Mobile Right */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link
              href="/cart"
              className="relative flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm"
            >
              <HiOutlineShoppingBag className="text-[19px] text-[#2563ff]" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#2563ff] px-1 py-[1px] text-center text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen(!open)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-[#2563ff] shadow-sm"
            >
              {open ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            className="fixed left-0 top-[76px] z-40 w-full border-b border-slate-200 bg-white px-6 pb-6 pt-5 shadow-xl lg:hidden"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${mobileNavClass(
                    link.href
                  )}`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              ))}

              {session?.user?.role === "user" && (
                <Link
                  href="/orderHistory"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${mobileNavClass(
                    "/orderHistory"
                  )}`}
                >
                  <FaClipboardList />
                  Order History
                </Link>
              )}

              {session?.user?.role === "user" && (
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${mobileNavClass(
                    "/profile"
                  )}`}
                >
                  <FaUserCircle />
                  Profile
                </Link>
              )}

              {!session && status !== "loading" && (
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#2563ff] py-3 font-semibold text-white transition hover:bg-[#1f55db]"
                >
                  <FaSignInAlt />
                  Login / Sign Up
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}