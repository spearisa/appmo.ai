import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AppEditor } from "@/components/editor";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export default async function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const project = await prisma.project.findUnique({
    where: {
      ownerId_slug: {
        ownerId: session.user.id,
        slug,
      },
    },
    include: { repo: true },
  });

  if (!project) {
    notFound();
  }

  const normalizedPrompts =
    Array.isArray(project.prompts) && project.prompts.every((item) => typeof item === "string")
      ? (project.prompts as string[])
      : [];

  return (
    <AppEditor
      project={{
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        html: project.html,
        prompts: normalizedPrompts,
        lastCommitSha: project.lastCommitSha,
        lastSyncedAt: project.lastSyncedAt?.toISOString() ?? null,
        defaultBranch: project.repo?.defaultBranch ?? null,
        repoHtmlUrl: project.repo?.htmlUrl ?? null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      }}
    />
  );
}

