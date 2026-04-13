import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

export const metadata: Metadata = {
  title: "Lave Mineral",
  description: "Premium mineral water brand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen w-full bg-white text-gray-800 antialiased">
        <Providers>
          <div className="flex min-h-screen w-full flex-col">
            <Navbar />

            {/* Full-width page content */}
            <main className="w-full flex-1 pt-24">
              {children}
            </main>

            <Footer />
            <Chatbot />
          </div>
        </Providers>
      </body>
    </html>
  );
}