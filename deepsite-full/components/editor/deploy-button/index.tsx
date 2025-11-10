/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdSave } from "react-icons/md";
import { Rocket } from "lucide-react";

import SpaceIcon from "@/assets/space.svg";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export function DeployButton({
  html,
  prompts,
  initialTitle,
  initialDescription,
}: {
  html: string;
  prompts: string[];
  initialTitle?: string | null;
  initialDescription?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState(() => ({
    title:
      initialTitle ??
      (prompts.length > 0
        ? prompts[prompts.length - 1].slice(0, 60)
        : "New Appmo Project"),
    description: initialDescription ?? "",
    version: "1.0.0",
  }));

  const saveProject = async () => {
    if (!config.title) {
      toast.error("Please enter a project title.");
      return;
    }

    const trimmedVersion = config.version.trim();
    if (trimmedVersion && !/^\d+\.\d+\.\d+$/.test(trimmedVersion)) {
      toast.error("Version must follow the pattern 0.0.0.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/projects", {
        title: config.title,
        description: config.description,
        html,
        prompts,
        version: trimmedVersion || undefined,
      });
      if (res.data.ok) {
        toast.success(
          trimmedVersion
            ? `Version ${trimmedVersion} deployed to your workspace! 🚀`
            : "Project saved to your workspace! 🎉"
        );
        router.push(`/projects/${res.data.project.slug}`);
      } else {
        toast.error(res?.data?.error || "Failed to save project");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error("Sign in with GitHub to save your project.");
        router.push("/auth/signin");
        return;
      }
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // TODO add a way to do not allow people to deploy if the html is broken.

  return (
    <div className="flex items-center justify-end gap-5">
      <div className="relative flex items-center justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <div>
              <Button variant="default" className="max-lg:hidden !px-4">
                <MdSave className="size-4" />
                Save Project
              </Button>
              <Button variant="default" size="sm" className="lg:hidden">
                Deploy
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="!rounded-2xl !p-0 !bg-white !border-neutral-200 min-w-xs text-center overflow-hidden"
            align="end"
          >
            <header className="bg-neutral-50 p-6 border-b border-neutral-200/60">
              <div className="flex items-center justify-center -space-x-4 mb-3">
                <div className="size-9 rounded-full bg-amber-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                  🚀
                </div>
                <div className="size-11 rounded-full bg-red-200 shadow-2xl flex items-center justify-center z-2">
                  <Image
                    src={SpaceIcon}
                    alt="Space Icon"
                    className="size-7"
                  />
                </div>
                <div className="size-9 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                  👻
                </div>
              </div>
              <p className="text-xl font-semibold text-neutral-950">
                Deploy to Workspace
              </p>
              <p className="text-sm text-neutral-500 mt-1.5">
                Persist the latest version of your project so you can revisit,
                iterate, and share it later.
              </p>
            </header>
            <main className="space-y-4 p-6">
              <div>
                <p className="text-sm text-neutral-700 mb-2">Project title</p>
                <Input
                  type="text"
                  placeholder="My Awesome Website"
                  value={config.title}
                  onChange={(e) =>
                    setConfig({ ...config, title: e.target.value })
                  }
                  className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
                />
              </div>
              <div>
                <p className="text-sm text-neutral-700 mb-2">
                  Optional description
                </p>
                <Input
                  type="text"
                  placeholder="What makes this site special?"
                  value={config.description}
                  onChange={(e) =>
                    setConfig({ ...config, description: e.target.value })
                  }
                  className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
                />
              </div>
              <div>
                <p className="text-sm text-neutral-700 mb-2">Version</p>
                <Input
                  type="text"
                  placeholder="1.0.0"
                  value={config.version}
                  onChange={(e) =>
                    setConfig({ ...config, version: e.target.value })
                  }
                  className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
                />
              </div>
              <div>
                <p className="text-sm text-neutral-700 mb-2">
                  Deploy to publish this version to your workspace.
                </p>
                <Button
                  variant="black"
                  onClick={saveProject}
                  className="relative w-full"
                  disabled={loading}
                >
                  Deploy <Rocket className="size-4" />
                  {loading && <Loading className="ml-2 size-4 animate-spin" />}
                </Button>
              </div>
            </main>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
