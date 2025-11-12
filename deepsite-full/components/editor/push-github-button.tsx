"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GithubIcon, Rocket } from "lucide-react";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";

export function PushToGitHubButton({
  slug,
  branch,
}: {
  slug: string;
  branch?: string | null;
}) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    owner: user?.login ?? "",
    repo: "",
    branch: branch ?? "main",
    path: "index.html",
    message: "Update generated Appmo website",
  });

  const handleSubmit = async () => {
    if (!form.owner || !form.repo) {
      toast.error("Please provide both owner and repository name.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/projects/${slug}/push`, form);
      if (res.data.ok) {
        toast.success("Project pushed to GitHub!");
        setOpen(false);
      } else {
        toast.error(res.data.error || "Failed to push to GitHub.");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error?: string }>;
      if (axiosError?.response?.status === 401) {
        toast.error("Sign in with GitHub to push code.");
      } else {
        toast.error(
          axiosError.response?.data?.error || axiosError.message || "Failed to push to GitHub."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          <GithubIcon className="size-4" />
          Push to GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Push to GitHub</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Owner / Organization
            </label>
            <Input
              placeholder="github-username"
              value={form.owner}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, owner: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Repository
            </label>
            <Input
              placeholder="awesome-appmo-site"
              value={form.repo}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, repo: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Branch
            </label>
            <Input
              placeholder="main"
              value={form.branch}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, branch: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              File path
            </label>
            <Input
              placeholder="index.html"
              value={form.path}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, path: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Commit message
            </label>
            <Input
              placeholder="Update generated Appmo website"
              value={form.message}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, message: event.target.value }))
              }
            />
          </div>
          <Button
            onClick={handleSubmit}
            variant="black"
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Rocket className="size-4" />
            Push
            {loading && <Loading className="ml-2 size-4 animate-spin" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

