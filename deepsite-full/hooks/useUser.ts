/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { signOut, useSession } from "next-auth/react";

import type { CurrentUser } from "@/types";

export const useUser = () => {
  const { data, status } = useSession();

  const logout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const user: CurrentUser | null = data?.user
    ? {
        id: data.user.id,
        name: data.user.name ?? null,
        login: data.user.login ?? null,
        email: data.user.email ?? null,
        avatarUrl: data.user.image ?? null,
      }
    : null;

  return {
    user,
    loading: status === "loading",
    logout,
  };
};