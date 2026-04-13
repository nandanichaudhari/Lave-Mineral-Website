import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { UserRole, UserMode } from "@/types/next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        const email = credentials.email.trim().toLowerCase();
        const admin = await Admin.findOne({ email }).select("+password");

        if (!admin) {
          throw new Error("Admin not found");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          admin.password
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: "admin" as UserRole,
          mode: "admin" as UserMode,
          phone: "",
          address: "",
          isImpersonating: false,
          impersonatedUserId: null,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = "admin";
        token.mode = "admin";
        token.phone = "";
        token.address = "";
        token.isImpersonating = false;
        token.impersonatedUserId = null;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name || token.name;
        token.email = session.user.email || token.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.name = (token.name as string) || "";
        session.user.email = (token.email as string) || "";
        session.user.role = "admin";
        session.user.mode = "admin";
        session.user.phone = "";
        session.user.address = "";
        session.user.isImpersonating = false;
        session.user.impersonatedUserId = null;
      }

      session.mode = "admin";
      return session;
    },
  },

  cookies: {
    sessionToken: {
      name: "admin-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "admin-csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "admin-callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};