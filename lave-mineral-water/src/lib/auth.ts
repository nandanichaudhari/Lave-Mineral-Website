import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { UserRole, UserMode } from "@/types/next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Customer Login",
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
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: "user" as UserRole,
          mode: "user" as UserMode,
          phone: user.phone || "",
          address: user.address || "",
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
        token.role = user.role as UserRole;
        token.mode = user.mode as UserMode;
        token.phone = user.phone || "";
        token.address = user.address || "";
        token.isImpersonating = user.isImpersonating ?? false;
        token.impersonatedUserId = user.impersonatedUserId ?? null;
      }

      if (trigger === "update") {
        if (session?.mode) token.mode = session.mode as UserMode;
        if (session?.user?.name) token.name = session.user.name;
        if (session?.user?.phone !== undefined) token.phone = session.user.phone;
        if (session?.user?.address !== undefined) {
          token.address = session.user.address;
        }
      }

      token.role = (token.role as UserRole) || "user";
      token.mode = (token.mode as UserMode) || "user";
      token.phone = (token.phone as string) || "";
      token.address = (token.address as string) || "";
      token.isImpersonating = token.isImpersonating ?? false;
      token.impersonatedUserId = token.impersonatedUserId ?? null;

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.name = (token.name as string) || "";
        session.user.email = (token.email as string) || "";
        session.user.role = (token.role as UserRole) || "user";
        session.user.mode = (token.mode as UserMode) || "user";
        session.user.phone = (token.phone as string) || "";
        session.user.address = (token.address as string) || "";
        session.user.isImpersonating = token.isImpersonating ?? false;
        session.user.impersonatedUserId = token.impersonatedUserId ?? null;
      }

      session.mode = (token.mode as UserMode) || "user";
      return session;
    },
  },

  cookies: {
    sessionToken: {
      name: "user-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "user-csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "user-callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};