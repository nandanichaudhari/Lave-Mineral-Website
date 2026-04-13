import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    let { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    name = name.trim();
    email = email.toLowerCase().trim();
    password = password.trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const allowedAdmins =
      process.env.ADMIN_EMAILS?.split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean) || [];

    if (!allowedAdmins.includes(email)) {
      return NextResponse.json(
        { error: "This email is not allowed for admin signup" },
        { status: 403 }
      );
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin already exists" },
        { status: 400 }
      );
    }

    const adminCount = await Admin.countDocuments();

    if (adminCount >= 2) {
      return NextResponse.json(
        { error: "Only 2 admins allowed" },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin created successfully",
        admin: {
          id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("ADMIN SIGNUP ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Signup failed" },
      { status: 500 }
    );
  }
}