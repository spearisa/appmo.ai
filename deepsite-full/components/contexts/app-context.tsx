/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser } from "@/hooks/useUser";
import { UserContext } from "@/components/contexts/user-context";

export default function AppContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useUser();

  return (
    <UserContext value={{ user, loading, logout } as any}>
      {children}
    </UserContext>
  );
}
