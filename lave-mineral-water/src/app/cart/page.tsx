"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";

interface CartItem {
  productId: number;
  name: string;
  img: string;
  size: string;
  qty: number;
  status?: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CartItem | null>(null);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart", {
        cache: "no-store",
      });
      const data = await res.json();
      setCart(Array.isArray(data?.cart?.items) ? data.cart.items : []);
    } catch (err) {
      console.error(err);
      setCart([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const increaseQty = async (item: CartItem) => {
    await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product: {
          productId: item.productId,
          name: item.name,
          img: item.img,
          size: item.size,
          qty: 1,
        },
      }),
    });
    fetchCart();
  };

  const decreaseQty = async (item: CartItem) => {
    if (item.qty <= 1) return;

    await fetch("/api/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: item.productId,
      }),
    });

    await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product: {
          productId: item.productId,
          name: item.name,
          img: item.img,
          size: item.size,
          qty: item.qty - 1,
        },
      }),
    });

    fetchCart();
  };

  const removeItem = async (id: number) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: id }),
    });
    fetchCart();
  };

  const totalBottles = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <main className="min-h-screen p-6 bg-white font-sans">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-[#2d3748] tracking-wide">
        🛒 Your Premium Cart
      </h1>

      <div className="flex justify-center mb-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="px-10 py-6 rounded-3xl flex flex-col items-center
          bg-white border border-gray-200 shadow-lg"
        >
          <span className="text-4xl font-bold text-[#4c6ef5]">
            {totalBottles}
          </span>
          <span className="text-[#4a5568] mt-1 text-sm tracking-wide">
            Total Bottles
          </span>
        </motion.div>
      </div>

      {cart.length === 0 ? (
        <p className="text-center text-[#718096] text-lg mt-20">
          Your cart is empty
        </p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.productId}
                layout
                whileHover={{ scale: 1.03 }}
                className="p-6 rounded-3xl flex flex-col items-center cursor-pointer transition-all duration-300
                bg-white border border-gray-200 shadow-md hover:shadow-xl"
                onClick={() => setSelectedProduct(item)}
              >
                <Image
                  src={item.img}
                  alt={item.name}
                  width={180}
                  height={180}
                  className="rounded-xl mb-4 shadow-sm"
                />

                <h2 className="font-bold text-lg text-[#2d3748]">{item.name}</h2>
                <p className="text-sm text-[#718096]">{item.size}</p>

                <div
                  className="mt-4 flex items-center gap-4 px-4 py-2 rounded-full
                  bg-gray-50 border border-gray-200"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      decreaseQty(item);
                    }}
                    className="hover:bg-[#4c6ef5] hover:text-white px-3 py-1 rounded-full transition"
                  >
                    <FaMinus />
                  </button>

                  <span className="text-[#2d3748] font-semibold">
                    {item.qty}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      increaseQty(item);
                    }}
                    className="hover:bg-[#4c6ef5] hover:text-white px-3 py-1 rounded-full transition"
                  >
                    <FaPlus />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.productId);
                    }}
                    className="text-red-500 hover:text-red-700 transition ml-2"
                  >
                    <FaTrashAlt />
                  </button>
                </div>

                <p className="mt-3 text-sm text-[#4a5568]">
                  Status:{" "}
                  <span className="text-[#4c6ef5] font-semibold">
                    {item.status || "In Cart"}
                  </span>
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="rounded-3xl p-6 max-w-md w-full flex flex-col items-center
              bg-white border border-gray-200 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedProduct.img}
                alt={selectedProduct.name}
                width={300}
                height={300}
                className="rounded-2xl mb-4 shadow-md"
              />

              <h2 className="text-2xl font-bold text-[#2d3748]">
                {selectedProduct.name}
              </h2>
              <p className="text-[#718096]">{selectedProduct.size}</p>

              <p className="mt-2 text-sm text-[#4a5568]">
                Status:{" "}
                <span className="text-[#4c6ef5] font-semibold">
                  {selectedProduct.status || "In Cart"}
                </span>
              </p>

              <Link
                href={`/order/${selectedProduct.productId}?name=${selectedProduct.name}&size=${selectedProduct.size}&img=${selectedProduct.img}`}
                onClick={() => setSelectedProduct(null)}
                className="mt-6 w-full bg-[#4c6ef5] hover:bg-[#3b5bdb] text-white font-semibold py-2 rounded-xl text-center transition-all shadow-md"
              >
                Buy Now
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}