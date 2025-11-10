"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { useUser } from "@/hooks/useUser";
import type { Project } from "@/types";
import { ProjectCard } from "./project-card";

export function MyProjects({ projects }: { projects: Project[] }) {
  const { user, loading } = useUser();
  const displayName = user?.name ?? user?.login ?? "Your";

  return (
    <section className="max-w-[86rem] py-12 px-4 mx-auto">
      <header className="flex items-center justify-between max-lg:flex-col gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white">
            {loading ? "Loading your projects..." : `${displayName}'s Projects`}
          </h1>
          <p className="text-muted-foreground text-base mt-1 max-w-xl">
            Your saved Appmo generations live here. Reopen a project to continue
            editing or push it to GitHub.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="bg-neutral-900 rounded-xl h-12 px-6 inline-flex items-center justify-center text-neutral-200 border border-neutral-800 hover:brightness-110 transition-all duration-200"
        >
          <Plus className="size-5 mr-2" />
          Create Project
        </Link>
      </header>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-3xl py-16 text-center text-neutral-400">
            <p className="text-lg font-medium">
              You don&apos;t have any saved projects yet.
            </p>
            <p className="text-sm mt-2">
              Generate something new and click &ldquo;Save Project&rdquo; to see
              it appear here.
            </p>
          </div>
        ) : (
          projects.map((project) => <ProjectCard key={project.id} project={project} />)
        )}
      </div>
    </section>
  );
}
