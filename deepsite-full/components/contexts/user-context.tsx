"use client";

import { createContext } from "react";
import type { CurrentUser } from "@/types";

export const UserContext = createContext({
  user: undefined as CurrentUser | undefined,
  loading: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: async () => {},
});
