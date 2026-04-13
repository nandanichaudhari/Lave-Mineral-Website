"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CATEGORIES, PRODUCTS } from "./constants";
import ProductCard from "@/components/ProductCard";

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProducts = activeFilter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.type === activeFilter);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#f0f6ff] to-[#e6f0ff] text-slate-900 font-sans overflow-hidden">

      {/* 🔥 PREMIUM BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute w-[400px] h-[400px] bg-[#0066FF]/20 blur-3xl rounded-full top-10 left-10 animate-pulse"></div>
        <div className="absolute w-[350px] h-[350px] bg-blue-400/20 blur-3xl rounded-full bottom-10 right-10 animate-pulse"></div>
      </div>

      {/* 🔥 HEADER */}
      <header className="pt-24 pb-16 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          
          <h1 className="text-5xl sm:text-6xl font-extralight tracking-[0.35em] text-[#0066FF] uppercase mb-5">
            Product
          </h1>

          <div className="h-[2px] w-20 bg-gradient-to-r from-[#0066FF] to-blue-400 mx-auto mb-5 rounded-full"></div>

          <p className="text-[10px] sm:text-xs tracking-[0.5em] text-slate-400 uppercase">
            Pure Water • Premium Experience
          </p>

        </motion.div>
      </header>

      {/* 🔥 FILTER BAR */}
      <div className="sticky top-6 z-50 flex justify-center px-4 mb-16">
        <nav className="backdrop-blur-2xl bg-white/60 border border-white/60 shadow-lg rounded-full p-1.5 flex gap-1 overflow-x-auto no-scrollbar">

          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`relative px-6 sm:px-8 py-2.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase whitespace-nowrap transition-all duration-300 ${
                activeFilter === cat ? "text-white" : "text-slate-600 hover:text-[#0066FF]"
              }`}
            >
              {activeFilter === cat && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-gradient-to-r from-[#0066FF] to-blue-500 rounded-full shadow-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}

        </nav>
      </div>

      {/* 🔥 PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 pb-28">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20"
        >
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 🔥 FOOTER */}
      <footer className="py-10 text-center border-t border-white/40 bg-white/60 backdrop-blur-xl">
        <p className="text-[10px] tracking-[0.4em] text-slate-400 uppercase">
          © 2026 LAVE MINERAL • PREMIUM WATER EXPERIENCE
        </p>
      </footer>
    </main>
  );
}