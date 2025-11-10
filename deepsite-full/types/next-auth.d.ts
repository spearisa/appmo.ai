import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      login?: string | null;
      githubId?: number | null;
      accessToken?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    login?: string | null;
    githubId?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    login?: string | null;
    githubId?: number | null;
    accessToken?: string | null;
  }
}

