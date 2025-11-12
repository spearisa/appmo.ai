"use client";

import { createContext } from "react";
import type { CurrentUser } from "@/types";

interface UserContextValue {
  user: CurrentUser | null | undefined;
  loading: boolean;
  logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextValue>({
  user: undefined,
  loading: false,
  logout: async () => {},
});
