import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
          githubId: profile.id,
        };
      },
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub ?? "";
        session.user.login = (token as Record<string, unknown>).login as
          | string
          | undefined;
        session.user.githubId = (token as Record<string, unknown>).githubId as
          | number
          | undefined;
        session.user.accessToken = (token as Record<string, unknown>)
          .accessToken as string | undefined;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.login = user.login ?? token.login;
        token.githubId =
          typeof user.githubId === "number"
            ? user.githubId
            : account?.providerAccountId
            ? Number(account.providerAccountId)
            : token.githubId;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, profile }) {
      if (!profile || !user?.id) return;
      const githubProfile = profile as Record<string, unknown>;
      const githubIdValue =
        githubProfile.id !== undefined && githubProfile.id !== null
          ? BigInt(String(githubProfile.id))
          : user.githubId !== undefined && user.githubId !== null
          ? BigInt(user.githubId)
          : null;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          login: (githubProfile.login as string) ?? user.login ?? "",
          githubId: githubIdValue,
          updatedAt: new Date(),
        },
      });
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

