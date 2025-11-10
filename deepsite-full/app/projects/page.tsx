import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { MyProjects } from "@/components/my-projects";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { repo: true },
  });

  return (
    <MyProjects
      projects={projects.map((project) => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        html: project.html,
        prompts:
          Array.isArray(project.prompts) && project.prompts.every((item) => typeof item === "string")
            ? (project.prompts as string[])
            : [],
        lastCommitSha: project.lastCommitSha,
        lastSyncedAt: project.lastSyncedAt?.toISOString() ?? null,
        defaultBranch: project.repo?.defaultBranch ?? null,
        repoHtmlUrl: project.repo?.htmlUrl ?? null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      }))}
    />
  );
}

