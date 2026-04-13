"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaCamera,
  FaEnvelope,
  FaShieldAlt,
  FaCheckCircle,
  FaSignOutAlt,
  FaSave,
} from "react-icons/fa";

type AdminProfileResponse = {
  success?: boolean;
  admin?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  error?: string;
};

export default function AdminProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        const res = await fetch("/api/admin/profile", {
          method: "GET",
          cache: "no-store",
        });

        const data: AdminProfileResponse = await res.json();

        if (res.ok && data?.admin) {
          setProfileImage(data.admin.image || null);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [status]);

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setSelectedFile(file);
  };

  const handleSaveImage = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        body: formData,
      });

      const data: AdminProfileResponse = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to update profile image");
        return;
      }

      const newImage = data?.admin?.image || null;

      setProfileImage(newImage);
      setPreviewImage(null);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("Profile image updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong while updating image");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  if (status === "loading" || loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f8ff] text-slate-600">
        Loading profile...
      </div>
    );
  }

  if (!session) return null;

  const adminName = session.user?.name || "Admin User";
  const adminEmail = session.user?.email || "No email available";
  const displayImage = previewImage || profileImage;

  return (
    <div className="min-h-screen bg-[#f4f8ff]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] border border-[#0066ff]/10 bg-white shadow-[0_18px_45px_rgba(0,102,255,0.08)]"
        >
          <div className="relative bg-gradient-to-r from-[#0057db] via-[#0066ff] to-[#3b8cff] px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_45%,transparent)]" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                  Lave Mineral
                </p>
                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                  Admin Profile
                </h1>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                <FaShieldAlt className="text-[13px]" />
                Administrator
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-[28px] border border-[#0066ff]/10 bg-[#f8fbff] p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#0066ff]/15 bg-white shadow-[0_12px_30px_rgba(0,102,255,0.12)]">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt="Admin profile"
                        fill
                        sizes="128px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#eaf2ff] to-[#dbeaff] text-4xl font-bold text-[#0066ff]">
                        {adminName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleChooseImage}
                    className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#0066ff] text-white shadow-lg transition hover:scale-105"
                    title="Choose profile image"
                  >
                    <FaCamera className="text-sm" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  {adminName}
                </h2>

                <p className="mt-2 break-all text-sm text-slate-500">
                  {adminEmail}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#0066ff]/10 px-3 py-1.5 text-xs font-semibold text-[#0066ff]">
                    <FaShieldAlt className="text-[11px]" />
                    Admin
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                    <FaCheckCircle className="text-[11px]" />
                    Active
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleChooseImage}
                  className="mt-5 rounded-2xl border border-[#0066ff]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#0066ff] transition hover:bg-[#0066ff]/5"
                >
                  Change Profile Image
                </button>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleSaveImage}
                    disabled={uploading}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[#0066ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0052cc] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <FaSave />
                    {uploading ? "Saving..." : "Save Image"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-[#0066ff]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,102,255,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066ff]">
                  Basic Information
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoCard label="Full Name" value={adminName} />
                  <InfoCard label="Role" value="Administrator" />
                  <InfoCard
                    label="Email Address"
                    value={adminEmail}
                    icon={<FaEnvelope />}
                    full
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-red-100 bg-gradient-to-br from-red-50 to-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
                  Logout
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  Leave Admin Session
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  This will end your current admin session and take you back to
                  the admin login page.
                </p>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(239,68,68,0.22)] transition hover:bg-red-600"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
  full = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-[22px] border border-[#0066ff]/10 bg-[#f8fbff] p-4 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0066ff]/10 text-[#0066ff]">
            {icon}
          </div>
        ) : null}

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 break-words text-base font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}