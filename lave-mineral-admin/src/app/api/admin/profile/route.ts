import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// 🔐 Get Admin from Token
async function getAdminFromToken(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "admin-session-token",
  });

  if (!token?.email) return null;

  await connectDB();

  const admin = await Admin.findOne({
    email: String(token.email).toLowerCase(),
  });

  return admin;
}

// ✅ GET ADMIN PROFILE (UPDATED)
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromToken(req);

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        name: admin.name || "",
        email: admin.email || "",
        image: admin.image || "",

        // ✅ NEW FIELDS (IMPORTANT FOR CHECKOUT)
        phone: admin.phone || "",
        address: admin.address || "",
        city: admin.city || "",
        state: admin.state || "",
        pincode: admin.pincode || "",

        alternatePhoneNumbers: admin.alternatePhoneNumbers || [],
        alternateAddresses: admin.alternateAddresses || [],
      },
    });
  } catch (error) {
    console.error("Admin profile fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch admin profile" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE PROFILE IMAGE (UNCHANGED + SAFE)
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromToken(req);

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image size must be 2MB or less" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const imageDataUrl = `data:${file.type};base64,${base64}`;

    const updatedAdmin = await Admin.findOneAndUpdate(
      { email: admin.email.toLowerCase() },
      { image: imageDataUrl },
      { new: true }
    ).select("name email image phone address city state pincode");

    if (!updatedAdmin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile image updated successfully",
      admin: {
        id: updatedAdmin._id.toString(),
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        image: updatedAdmin.image || "",

        phone: updatedAdmin.phone || "",
        address: updatedAdmin.address || "",
        city: updatedAdmin.city || "",
        state: updatedAdmin.state || "",
        pincode: updatedAdmin.pincode || "",
      },
    });
  } catch (error) {
    console.error("Admin profile update error:", error);

    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
}