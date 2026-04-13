import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0d3b66] to-[#06243c] text-white pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/images/logo2.png"
              alt="Logo"
              width={50}
              height={50}
              className="rounded-full bg-white p-1"
            />
            <h2 className="text-2xl font-bold">LAVE MINERAL</h2>
          </div>

          <p className="text-gray-300">
            Premium mineral water crafted from the purest sources.
            Experience the essence of nature in every drop.
          </p>

          <div className="flex gap-3 mt-4">
            <a
              href="#"
              aria-label="Instagram"
              className="text-gray-300 hover:text-white transition"
            >
              <FaInstagram size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3 text-gray-300">
            <li>
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/explore" className="hover:text-white transition">
                Explore
              </Link>
            </li>
            <li>
              <Link href="/custom" className="hover:text-white transition">
                Custom Bottle
              </Link>
            </li>
            <li>
              <Link href="/feedback" className="hover:text-white transition">
                Feedback
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
          <div className="space-y-4 text-gray-300">
            <div className="flex gap-3">
              <Mail size={18} />
              <span>info@lavemineral.com</span>
            </div>
            <div className="flex gap-3">
              <Phone size={18} />
              <span>+91 96699 53474</span>
            </div>
            <div className="flex gap-3">
              <MapPin size={18} />
              <span>
                near raddison hotel, Gulmohar Colony
                <br />
                Bhopal, Madhya Pradesh 462016
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 mt-12 pt-6 text-center text-gray-300">
        © 2026 Lave Mineral. All rights reserved.
      </div>
    </footer>
  );
}