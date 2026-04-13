"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaPen,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();

  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");

  useEffect(() => {
    if (session?.user) {
      setFormName(session.user.name || "");
      setFormEmail(session.user.email || "");
      setFormPhone(session.user.phone || "");
      setFormAddress(session.user.address || "");
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef5ff_0%,#f7fbff_38%,#ffffff_100%)]">
        <p className="text-lg font-semibold text-[#0066ff]">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef5ff_0%,#f7fbff_38%,#ffffff_100%)] px-4">
        <div className="rounded-[28px] border border-red-100 bg-white/90 px-6 py-8 text-center shadow-xl">
          <p className="text-lg font-semibold text-red-500">
            Please login to view your profile
          </p>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          address: formAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update profile");
        return;
      }

      await update({
        user: {
          ...session.user,
          name: formName,
          phone: formPhone,
          address: formAddress,
        },
      });

      alert("Profile updated successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eef5ff_0%,#f7fbff_35%,#ffffff_100%)] px-4 py-8 md:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(0,102,255,0.10),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(0,102,255,0.06),transparent_24%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-[70%] -translate-x-1/2 rounded-full bg-[#0066ff]/8 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="overflow-hidden rounded-[36px] border border-[#6ea7ff]/20 bg-gradient-to-r from-[#0a63f3] via-[#156df6] to-[#4b91f6] shadow-[0_28px_80px_rgba(0,102,255,0.22)]">
            <div className="bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_40%,transparent)] px-6 py-8 sm:px-9 sm:py-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                  Lave Mineral
                </p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  My Profile
                </h1>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="overflow-hidden rounded-[32px] border border-white/75 bg-white/72 backdrop-blur-2xl shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="border-b border-[#e8f0ff] bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-6 lg:border-b-0 lg:border-r sm:p-8">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ scale: 1.04, rotate: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-28 w-28 items-center justify-center rounded-full border border-[#d7e8ff] bg-gradient-to-br from-[#eef5ff] to-[#dcecff] text-[#0066ff] shadow-[0_16px_36px_rgba(0,102,255,0.12)]"
                >
                  <FaUser className="text-4xl" />
                </motion.div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  {session.user?.name || "User"}
                </h2>

                <p className="mt-2 break-all text-sm text-slate-500">
                  {session.user?.email || "No email"}
                </p>

                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSettings(true)}
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0057db] to-[#0066ff] px-5 py-3 font-semibold text-white shadow-[0_16px_34px_rgba(0,102,255,0.22)] transition-all hover:shadow-[0_22px_46px_rgba(0,102,255,0.30)]"
                >
                  <FaPen />
                  Edit Profile
                </motion.button>

                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 transition-all hover:bg-red-100 hover:shadow-[0_16px_30px_rgba(239,68,68,0.14)]"
                >
                  <FaSignOutAlt />
                  Logout
                </motion.button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard
                  icon={<FaUser />}
                  label="Full Name"
                  value={session.user?.name || "Not available"}
                />
                <InfoCard
                  icon={<FaEnvelope />}
                  label="Email Address"
                  value={session.user?.email || "Not available"}
                />
                <InfoCard
                  icon={<FaPhoneAlt />}
                  label="Phone Number"
                  value={session.user?.phone || "Not added"}
                />
                <InfoCard
                  icon={<FaMapMarkerAlt />}
                  label="Address"
                  value={session.user?.address || "Not added"}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <Modal title="Edit Profile" onClose={() => setShowSettings(false)}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <InputField
                  label="Name"
                  value={formName}
                  onChange={setFormName}
                  icon={<FaUser />}
                  placeholder="Enter your name"
                />

                <InputField
                  label="Email"
                  value={formEmail}
                  onChange={setFormEmail}
                  icon={<FaEnvelope />}
                  placeholder="Enter your email"
                  readOnly
                />

                <InputField
                  label="Phone Number"
                  value={formPhone}
                  onChange={setFormPhone}
                  icon={<FaPhoneAlt />}
                  placeholder="Enter phone number"
                />

                <TextAreaField
                  label="Address"
                  value={formAddress}
                  onChange={setFormAddress}
                  icon={<FaMapMarkerAlt />}
                  placeholder="Enter full address"
                />
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#0058df] via-[#0066ff] to-[#2f8cff] px-5 py-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(0,102,255,0.20)] transition-all hover:shadow-[0_18px_38px_rgba(0,102,255,0.28)] disabled:opacity-60"
                >
                  <FaPen />
                  {saving ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-[24px] border border-white/75 bg-white/72 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)] backdrop-blur-2xl transition-all hover:shadow-[0_22px_42px_rgba(0,102,255,0.10)]"
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ rotate: -8, scale: 1.08 }}
          transition={{ duration: 0.2 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d7e8ff] bg-gradient-to-br from-[#eef5ff] to-[#dcecff] text-[#0066ff] shadow-[0_10px_24px_rgba(0,102,255,0.08)]"
        >
          {icon}
        </motion.div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 break-words text-base font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function InputField({
  label,
  value,
  onChange,
  icon,
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  placeholder: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-[#dbe7f6] bg-white/95 px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)] transition-all hover:border-[#bfd7ff] hover:shadow-[0_14px_28px_rgba(0,102,255,0.08)]">
        <div className="text-[#0066ff]">{icon}</div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full bg-transparent text-slate-800 outline-none ${
            readOnly ? "cursor-not-allowed opacity-70" : ""
          }`}
        />
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  icon,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className="rounded-2xl border border-[#dbe7f6] bg-white/95 px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)] transition-all hover:border-[#bfd7ff] hover:shadow-[0_14px_28px_rgba(0,102,255,0.08)]">
        <div className="mb-3 flex items-center gap-3 text-[#0066ff]">
          {icon}
          <span className="text-sm text-slate-500">Address</span>
        </div>
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-slate-800 outline-none"
        />
      </div>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(226,237,255,0.58)] p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 28, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.96 }}
        transition={{ duration: 0.24 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-[30px] border border-white/80 bg-white/90 p-5 text-slate-800 shadow-[0_34px_90px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 6 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
          >
            <FaTimes />
          </motion.button>
        </div>

        {children}
      </motion.div>
    </motion.div>
  );
}