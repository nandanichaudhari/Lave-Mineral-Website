import NextAuth, { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

export type UserRole = "admin" | "user";
export type UserMode = "admin" | "user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      mode: UserMode;
      phone?: string;
      address?: string;
      isImpersonating?: boolean;
      impersonatedUserId?: string | null;
    } & DefaultSession["user"];

    mode?: UserMode;
  }

  interface User {
    id: string;
    role: UserRole;
    mode: UserMode;
    phone?: string;
    address?: string;
    isImpersonating?: boolean;
    impersonatedUserId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole;
    mode?: UserMode;
    phone?: string;
    address?: string;
    isImpersonating?: boolean;
    impersonatedUserId?: string | null;
  }
}