"use client";

import Image from "next/image";
import Link from "next/link";
import { Droplet, Shield, Leaf, Award, Star, ArrowRight } from "lucide-react";
import FeedbackSection from "@/components/FeedbackSection";

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section
        className="relative flex min-h-[calc(100vh-90px)] w-full items-center justify-center overflow-hidden px-6 text-center"
        style={{
          backgroundImage: "url('/images/hero-bg1.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

        <div className="relative z-10 mx-auto w-full max-w-4xl py-20">
          <Image
            src="/images/logo2.png"
            alt="Lave Mineral Logo"
            width={90}
            height={90}
            className="mx-auto mb-6"
            priority
          />

          <h1 className="text-4xl font-bold leading-tight text-[#0d3b66] md:text-6xl">
            Pure Water,
            <span className="block text-[#2563ff]">Pure Life</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
            Experience the essence of nature in every drop. Premium mineral
            water crafted from the purest mountain springs.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full bg-[#2563ff] px-7 py-3 text-base font-medium text-white transition hover:bg-[#1f55db]"
            >
              Explore Products
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/customize"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border-2 border-[#2563ff] px-7 py-3 text-base font-medium text-[#2563ff] transition hover:bg-blue-50"
            >
              Customize Your Bottle
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="w-full bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-4xl font-bold text-[#0A1F44] md:text-5xl">
            Why Choose Lave Mineral?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We&apos;re committed to delivering the finest mineral water
            experience
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-[#E9EEF5] p-10 text-center transition hover:shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                <Droplet size={28} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#0A1F44]">
                Pure & Natural
              </h3>
              <p className="mt-3 text-gray-600">
                Sourced from pristine mountain springs, untouched by pollution
              </p>
            </div>

            <div className="rounded-3xl bg-[#E9EEF5] p-10 text-center transition hover:shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                <Shield size={28} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#0A1F44]">
                Quality Tested
              </h3>
              <p className="mt-3 text-gray-600">
                Rigorous testing ensures the highest purity standards
              </p>
            </div>

            <div className="rounded-3xl bg-[#E9EEF5] p-10 text-center transition hover:shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                <Leaf size={28} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#0A1F44]">
                Eco-Friendly
              </h3>
              <p className="mt-3 text-gray-600">
                Sustainable packaging and carbon-neutral production
              </p>
            </div>

            <div className="rounded-3xl bg-[#E9EEF5] p-10 text-center transition hover:shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                <Award size={28} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#0A1F44]">
                Award Winning
              </h3>
              <p className="mt-3 text-gray-600">
                Recognized globally for exceptional taste and quality
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Bottles */}
      <section className="w-full bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-800">
              Our Premium Bottles
            </h2>
            <p className="mt-4 text-gray-500">
              Pure. Fresh. Naturally Filtered.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 text-center shadow-lg transition duration-300 hover:shadow-2xl">
              <Image
                src="/images/bottle1.png"
                alt="500ml Bottle"
                width={260}
                height={260}
                className="mx-auto h-64 w-auto object-contain"
              />
              <h3 className="mt-6 text-xl font-semibold">500ml Bottle</h3>
              <p className="mt-2 text-gray-500">
                Perfect for daily hydration on the go.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 text-center shadow-lg transition duration-300 hover:shadow-2xl">
              <Image
                src="/images/bottle2.png"
                alt="1L Bottle"
                width={260}
                height={260}
                className="mx-auto h-64 w-auto object-contain"
              />
              <h3 className="mt-6 text-xl font-semibold">1L Bottle</h3>
              <p className="mt-2 text-gray-500">
                Ideal for office and home use.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 text-center shadow-lg transition duration-300 hover:shadow-2xl">
              <Image
                src="/images/bottle3.png"
                alt="2L Bottle"
                width={260}
                height={260}
                className="mx-auto h-64 w-auto object-contain"
              />
              <h3 className="mt-6 text-xl font-semibold">2L Bottle</h3>
              <p className="mt-2 text-gray-500">
                Best for families and long trips.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FeedbackSection/>


      {/* Final CTA */}
      <section
        className="relative flex h-[400px] w-full items-center justify-center overflow-hidden px-6 text-center text-white"
        style={{
          backgroundImage: "url('/images/ready-water.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            Ready to Experience Pure Perfection?
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Refresh your life with the finest quality mineral water, crafted
            for purity and excellence.
          </p>

          <Link
            href="/explore"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </section>
    </main>
  );
}