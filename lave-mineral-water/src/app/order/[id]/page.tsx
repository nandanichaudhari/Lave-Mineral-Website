"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaBoxOpen, FaWater, FaCheckCircle } from "react-icons/fa";
import OrderForm from "@/components/OrderForm";
import { PRODUCTS } from "@/app/explore/constants";

export default function OrderPage() {
  const params = useParams();
  const productId = Number(params?.id);
  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 text-lg md:text-xl">
        Product not found
      </div>
    );
  }

  const isSquare = product.type === "Square Shape";

  return (
    <main className="min-h-screen px-4 sm:px-6 md:px-10 py-10 md:py-16 bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 md:mb-14"
      >
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-widest text-cyan-700 uppercase">
          Order {product.name}
        </h1>
        <p className="text-gray-500 mt-2 md:mt-3 text-sm md:text-base tracking-wide">
          Premium Mineral Water • Bulk Ordering System
        </p>
      </motion.div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-7xl mx-auto items-start">
        
        {/* LEFT SIDE */}
        <div className="md:sticky md:top-24 h-fit">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-xl bg-white/40 border border-white/50 shadow-lg md:shadow-xl rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 hover:shadow-cyan-200 transition-all duration-300"
          >
            
            {/* PRODUCT IMAGE */}
            <div className="text-center mb-5 md:mb-6">
              <div className="relative mx-auto h-48 sm:h-56 md:h-72 w-full max-w-xs">
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  className="object-contain rounded-2xl drop-shadow-lg hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>

              <p className="mt-3 md:mt-4 font-semibold text-gray-800 text-base md:text-lg">
                {product.name}
              </p>

              <p className="text-cyan-600 font-bold text-xs md:text-sm tracking-wide">
                {product.size}
              </p>

              <p className="text-gray-500 text-xs mt-1">
                {product.type}
              </p>
            </div>

            {/* PACKAGING DETAILS */}
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <FaBoxOpen className="text-cyan-600 text-lg md:text-2xl" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Packaging Details
              </h2>
            </div>

            <ul className="space-y-2 text-gray-700 text-xs sm:text-sm">
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
                250ml →{" "}
                {isSquare
                  ? "35 / 40 bottles / box"
                  : "30 / 35 bottles / box"}
              </li>
            </ul>

            {/* MIN ORDER */}
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-green-100/40 border border-green-200 rounded-lg md:rounded-xl flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              <p className="text-xs sm:text-sm text-green-700 font-medium">
                Minimum Order: 50 Boxes Required
              </p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="backdrop-blur-xl bg-white/40 border border-white/50 shadow-lg md:shadow-xl rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 hover:shadow-cyan-200 transition-all duration-300"
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