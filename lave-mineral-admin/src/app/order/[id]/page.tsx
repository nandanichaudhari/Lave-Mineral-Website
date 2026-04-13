"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaBoxOpen, FaWater, FaCheckCircle } from "react-icons/fa";
import OrderForm from "@/components/OrderForm";
import { PRODUCTS } from "@/app/explore/constants";

export default function OrderPage() {
  const params = useParams();

  const rawId = params?.id;
  const productId = Number(Array.isArray(rawId) ? rawId[0] : rawId);

  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product || Number.isNaN(productId)) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-red-500 md:text-xl">
        Product not found
      </div>
    );
  }

  const isSquare = product.type === "Square Shape";

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 px-4 py-10 sm:px-6 md:px-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-10 text-center md:mb-14"
      >
        <h1 className="text-2xl font-light uppercase tracking-widest text-cyan-700 sm:text-3xl md:text-5xl">
          Order {product.name}
        </h1>

        <p className="mt-2 text-sm tracking-wide text-gray-500 md:mt-3 md:text-base">
          Premium Mineral Water • Bulk Ordering System
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12">
        <div className="h-fit md:sticky md:top-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-white/50 bg-white/40 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-cyan-200 sm:p-6 md:rounded-3xl md:p-8 md:shadow-xl"
          >
            <div className="mb-5 text-center md:mb-6">
              <div className="relative mx-auto h-48 w-full max-w-xs sm:h-56 md:h-72">
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="rounded-2xl object-contain drop-shadow-lg transition-transform duration-300 hover:scale-105"
                  priority
                />
              </div>

              <p className="mt-3 text-base font-semibold text-gray-800 md:mt-4 md:text-lg">
                {product.name}
              </p>

              <p className="text-xs font-bold tracking-wide text-cyan-600 md:text-sm">
                {product.size}
              </p>

              <p className="mt-1 text-xs text-gray-500">{product.type}</p>
            </div>

            <div className="mb-3 flex items-center gap-2 md:mb-4 md:gap-3">
              <FaBoxOpen className="text-lg text-cyan-600 md:text-2xl" />
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">
                Packaging Details
              </h2>
            </div>

            <ul className="space-y-2 text-xs text-gray-700 sm:text-sm">
              <li className="flex items-center gap-2">
                <FaWater className="text-cyan-500" />
                1L → 12 bottles / box
              </li>

              <li className="flex items-center gap-2">
                <FaWater className="text-cyan-500" />
                500ml → 24 bottles / box
              </li>

              <li className="flex items-center gap-2">
                <FaWater className="text-cyan-500" />
                250ml → {isSquare ? "35 / 40 bottles / box" : "30 / 35 bottles / box"}
              </li>
            </ul>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-100/40 p-3 md:mt-6 md:rounded-xl md:p-4">
              <FaCheckCircle className="text-green-600" />
              <p className="text-xs font-medium text-green-700 sm:text-sm">
                Minimum Order: 50 Boxes Required
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-white/50 bg-white/40 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-cyan-200 sm:p-5 md:rounded-3xl md:p-6 md:shadow-xl"
        >
          <OrderForm
            product={product.name}
            defaultSize={product.size}
            type={product.type}
            img={product.img}
          />
        </motion.div>
      </div>
    </main>
  );
}