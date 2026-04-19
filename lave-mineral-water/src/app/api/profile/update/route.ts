import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      alternatePhoneNumbers,
      alternateAddresses,
    } = body || {};

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const safeAlternatePhones = Array.isArray(alternatePhoneNumbers)
      ? alternatePhoneNumbers
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      : [];

    const safeAlternateAddresses = Array.isArray(alternateAddresses)
      ? alternateAddresses.map((item) => ({
          label: String(item?.label || "").trim(),
          address: String(item?.address || "").trim(),
          city: String(item?.city || "").trim(),
          state: String(item?.state || "").trim(),
          pincode: String(item?.pincode || "").trim(),
        }))
      : [];

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name: name.trim(),
          phone: phone?.trim() || "",
          address: address?.trim() || "",
          city: city?.trim() || "",
          state: state?.trim() || "",
          pincode: pincode?.trim() || "",
          alternatePhoneNumbers: safeAlternatePhones,
          alternateAddresses: safeAlternateAddresses,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
        city: updatedUser.city || "",
        state: updatedUser.state || "",
        pincode: updatedUser.pincode || "",
        alternatePhoneNumbers: updatedUser.alternatePhoneNumbers || [],
        alternateAddresses: updatedUser.alternateAddresses || [],
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}