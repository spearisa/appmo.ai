"use client";

import { GithubIcon } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="max-w-md w-full border border-neutral-800 rounded-3xl p-8 space-y-6 bg-neutral-900">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign in to Appmo</h1>
          <p className="text-neutral-400">
            Connect your GitHub account to save and manage your projects.
          </p>
        </header>
        <Button
          variant="default"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => signIn("github")}
        >
          <GithubIcon className="size-5" />
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
}

