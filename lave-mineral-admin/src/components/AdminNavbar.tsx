"use client";

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
  FaPalette,
  FaShoppingCart,
  FaInfoCircle,
} from "react-icons/fa";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: FaHome },
  { href: "/explore", label: "Products", icon: FaBoxOpen },
  { href: "/track", label: "Track", icon: FaTruck },
  { href: "/aboutus", label: "About Us", icon: FaInfoCircle },
  { href: "/customize", label: "Custom Bottle", icon: FaPalette },
  { href: "/cart", label: "Cart", icon: FaShoppingCart },
  { href: "/orderHistory", label: "Order Detail", icon: FaClipboardList },
  { href: "/profile", label: "Admin Profile", icon: FaUser },
] as const;

export default function AdminNavbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") return null;
  if (!session) return null;

  const isActive = (path: string) => pathname === path;

  const navItemClass = (active: boolean) =>
    [
      "group inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4",
      "text-sm font-medium transition-all duration-200 whitespace-nowrap",
      active
        ? "border border-[#0066ff]/15 bg-[#0066ff]/10 text-[#0066ff] shadow-[0_10px_24px_rgba(0,102,255,0.12)]"
        : "border border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900",
    ].join(" ");

  const iconClass = (active: boolean) =>
    active ? "text-[#0066ff]" : "text-slate-500";

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed left-0 top-0 z-50 w-full border-b border-white/70 bg-white/90 backdrop-blur-2xl shadow-[0_10px_35px_rgba(33,72,140,0.08)]"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[78px] items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_8px_24px_rgba(0,102,255,0.10)] sm:h-12 sm:w-12">
              <Image
                src="/images/logo2.png"
                alt="Lave Mineral"
                fill
                className="object-contain p-1.5"
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold tracking-tight text-[#0066ff]">
                LAVE MINERAL
              </h1>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:text-xs">
                Admin Panel
              </p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 xl:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navItemClass(active)}
                >
                  <Icon className={iconClass(active)} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="xl:hidden border-t border-white/40 py-3">
          <div className="scrollbar-none flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navItemClass(active)}
                >
                  <Icon className={iconClass(active)} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}