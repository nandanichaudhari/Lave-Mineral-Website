import "./globals.css";
import Providers from "./providers";
import AdminNavbar from "@/components/AdminNavbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-800 antialiased">
        <Providers>
          <div className="flex min-h-screen w-full flex-col">
            <AdminNavbar />

            {/* Navbar height offset */}
            <main className="w-full flex-1 pt-[78px]">
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