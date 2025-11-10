import Link from "next/link";
import { formatDistance } from "date-fns";
import { GithubIcon } from "lucide-react";

import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  const updatedLabel = formatDistance(new Date(project.updatedAt), new Date(), {
    addSuffix: true,
  });

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col justify-between bg-neutral-900 border border-neutral-800 rounded-3xl p-6 hover:border-sky-500/60 hover:shadow-[0_20px_60px_-40px_rgba(56,189,248,0.75)] transition-all duration-300"
    >
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Last updated {updatedLabel}
        </p>
        <h3 className="text-xl font-semibold text-white line-clamp-1">
          {project.title}
        </h3>
        <p className="text-sm text-neutral-400 line-clamp-2">
          {project.description ??
            (project.prompts.length > 0
              ? project.prompts[project.prompts.length - 1]
              : "Open to continue editing this project.")}
        </p>
      </div>
      <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-xs text-neutral-500 space-y-2 group-hover:border-sky-500/50">
        <div className="line-clamp-3">
          {project.html
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 160)}
          {project.html.length > 160 ? "…" : ""}
        </div>
        {project.repoHtmlUrl && (
          <a
            href={project.repoHtmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
          >
            <GithubIcon className="size-3.5" />
            View on GitHub
          </a>
        )}
      </div>
    </Link>
  );
}
