"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaShoppingCart, FaBolt } from "react-icons/fa";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  id: number;
  name: string;
  size: string;
  img: string;
  height: string;
  type: string;
};

export default function ProductCard({
  id,
  name,
  size,
  img,
  height,
  type,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Props | null>(null);

  const checkAuthAndRedirect = () => {
    if (!session) {
      router.push(`/login`);
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!checkAuthAndRedirect()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: { productId: id, name, size, img, qty: 1 },
        }),
      });

      if (res.ok) setAdded(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!checkAuthAndRedirect()) return;
    router.push(`/order/${id}?name=${name}&size=${size}&img=${img}&type=${type}`);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="group flex flex-col items-center rounded-3xl p-5 sm:p-6 bg-white/50 backdrop-blur-2xl border border-white/40 shadow-[0_10px_40px_rgba(0,102,255,0.12)] hover:shadow-[0_25px_70px_rgba(0,102,255,0.25)] transition-all duration-500 cursor-pointer"
        onClick={() => setSelectedProduct({ id, name, size, img, height, type })}
      >
        <div className="relative flex items-end justify-center w-full min-h-[260px] sm:min-h-[320px]">
          <div className="absolute inset-0 bg-[#0066FF]/20 blur-3xl opacity-0 group-hover:opacity-100 transition duration-700 rounded-full"></div>

          <motion.div whileHover={{ scale: 1.1, y: -10 }} className="relative z-10">
            <Image
              src={img}
              alt={name}
              width={220}
              height={300}
              className={`${height} object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_30px_60px_rgba(0,102,255,0.3)] transition-all duration-700`}
            />
          </motion.div>
        </div>

        <div className="mt-5 text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 tracking-wide">
            {name}
          </h3>
          <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-[#0066FF]/10 border border-[#0066FF]/20">
            <p className="text-xs font-semibold text-[#0066FF]">{size}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-5 w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={loading}
            className={`flex-1 px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-2 border backdrop-blur-md transition-all duration-300 ${
              added
                ? "bg-green-500 text-white border-green-400 shadow-green-300/40"
                : "bg-white/60 text-gray-700 border-white/40 hover:bg-[#0066FF] hover:text-white hover:shadow-blue-300/40"
            } hover:scale-105 active:scale-95`}
          >
            <FaShoppingCart size={12} />
            {loading ? "Adding..." : added ? "Added" : "Cart"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow();
            }}
            className="flex-1 px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-[#0066FF] to-blue-500 text-white shadow-lg hover:shadow-blue-400/50 transition-all hover:scale-105 active:scale-95"
          >
            <FaBolt size={12} />
            Buy
          </button>

          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=I want ${name} ${size}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-2 bg-white/60 border border-white/40 text-gray-700 hover:bg-green-500 hover:text-white hover:shadow-green-300/40 transition-all hover:scale-105 active:scale-95"
          >
            <FaWhatsapp size={12} />
            Chat
          </a>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 w-full max-w-md shadow-[0_20px_60px_rgba(0,102,255,0.25)] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedProduct.img}
                alt={selectedProduct.name}
                width={250}
                height={250}
                className="rounded-2xl shadow-lg mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedProduct.name}
              </h2>
              <p className="text-gray-500">{selectedProduct.size}</p>

              <div className="mt-5 flex gap-3 w-full">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-2 rounded-xl bg-[#0066FF] text-white shadow-lg hover:bg-blue-600 transition"
                >
                  Add
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#0066FF] to-blue-500 text-white shadow-lg hover:scale-105 transition"
                >
                  Buy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}