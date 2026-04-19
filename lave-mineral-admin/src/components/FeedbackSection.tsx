"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function FeedbackSection() {
  const [rating, setRating] = useState(0);

  return (
    <section className="w-full bg-gray-50 py-24 px-6">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0A1F44] md:text-5xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Trusted by thousands who value purity and quality
          </p>
        </div>

        {/* Main Layout: grid-cols-4 allows 3/4 for cards and 1/4 for form */}
        <div className="grid gap-8 lg:grid-cols-4 items-center">

          {/* LEFT: Reviews (The Wrapper) */}
          <div className="lg:col-span-3">
            <div className="grid gap-6 md:grid-cols-3">

              {/* Card 1 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[220px]">
                <div>
                  <h4 className="font-bold text-[#0A1F44]">Rahul Sharma</h4>
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    The taste and purity of Lave Mineral Water is unmatched.
                    It’s now our family's daily choice!
                  </p>
                </div>
                <div className="mt-4 flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[220px]">
                <div>
                  <h4 className="font-bold text-[#0A1F44]">Priya Verma</h4>
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    I love the eco-friendly packaging and premium feel.
                    Highly recommend it!
                  </p>
                </div>
                <div className="mt-4 flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[220px]">
                <div>
                  <h4 className="font-bold text-[#0A1F44]">Amit Patel</h4>
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    Perfect for office and home use. The quality speaks for itself.
                  </p>
                </div>
                <div className="mt-4 flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: Feedback Form (The Taller Card) */}
          <div className="rounded-2xl bg-white p-5 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-[#0A1F44] mb-6">
              Add Your Feedback
            </h3>

            <textarea
              placeholder="Type your feedback here..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all resize-none"
              rows={5}
              style={{ height: '90px', overflowY: 'scroll' }}
            />

            <div className="mt-4 flex flex-col gap-2">
               <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                    key={star}
                    onClick={() => setRating(star)}
                    size={24}
                    className={`cursor-pointer transition-transform hover:scale-110 ${
                        rating >= star
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                    />
                ))}
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Rate your experience
                </p>
            </div>

            <input
              type="text"
              placeholder="Your Name"
              className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
            />

            <button
              className="mt-5 w-full rounded-xl bg-[#2563ff] py-4 text-white font-bold shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98]">
              Submit My Feedback
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
