import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Octokit } from "@octokit/rest";
import { RequestError } from "@octokit/request-error";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

type RouteParams = Promise<{ slug: string }>;

const bodySchema = z.object({
  owner: z.string().min(1, "Repository owner is required."),
  repo: z.string().min(1, "Repository name is required."),
  branch: z.string().min(1).default("main"),
  path: z.string().min(1).default("index.html"),
  message: z
    .string()
    .min(1)
    .default("Update generated Appmo website"),
});

export async function POST(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.accessToken) {
    return NextResponse.json(
      {
        ok: false,
        error: "You must be signed in with GitHub to push code.",
      },
      { status: 401 }
    );
  }

  const parsedBody = bodySchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { ok: false, error: parsedBody.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { owner, repo, branch, path, message } = parsedBody.data;

  const project = await prisma.project.findUnique({
    where: {
      ownerId_slug: {
        ownerId: session.user.id,
        slug,
      },
    },
  });

  if (!project) {
    return NextResponse.json(
      { ok: false, error: "Project not found." },
      { status: 404 }
    );
  }

  const octokit = new Octokit({
    auth: session.user.accessToken,
  });

  let existingSha: string | undefined;
  try {
    const existing = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    if (!Array.isArray(existing.data) && "sha" in existing.data) {
      existingSha = existing.data.sha;
    }
  } catch (error: unknown) {
    if (error instanceof RequestError && error.status === 404) {
      // Missing file is fine; we'll create it below.
    } else if (error instanceof RequestError) {
      const responseData = error.response?.data;
      const responseMessage =
        typeof responseData === "object" &&
        responseData !== null &&
        "message" in responseData &&
        typeof responseData.message === "string"
          ? responseData.message
          : undefined;

      return NextResponse.json(
        {
          ok: false,
          error: responseMessage ?? error.message ?? "Failed to inspect repository contents.",
        },
        { status: error.status ?? 500 }
      );
    } else if (error instanceof Error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to inspect repository contents.",
        },
        { status: 500 }
      );
    }
  }

  const fileContent = Buffer.from(project.html, "utf-8").toString("base64");

  const pushResponse = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    branch,
    message,
    content: fileContent,
    sha: existingSha,
  });

  const commitSha = pushResponse.data.commit.sha;
  const htmlUrl =
    pushResponse.data.content?.html_url ??
    `https://github.com/${owner}/${repo}/blob/${branch}/${path}`;

  const repoRecord = await prisma.gitRepo.upsert({
    where: {
      userId_provider_owner_name: {
        userId: session.user.id,
        provider: "github",
        owner,
        name: repo,
      },
    },
    update: {
      defaultBranch: branch,
      htmlUrl,
    },
    create: {
      userId: session.user.id,
      provider: "github",
      owner,
      name: repo,
      defaultBranch: branch,
      htmlUrl,
    },
  });

  await prisma.project.update({
    where: { id: project.id },
    data: {
      repoId: repoRecord.id,
      lastCommitSha: commitSha,
      lastSyncedAt: new Date(),
    },
  });

  await prisma.projectVersion.create({
    data: {
      projectId: project.id,
      html: project.html,
      prompts: project.prompts as unknown as Prisma.JsonValue,
      summary: `Pushed to ${owner}/${repo}`,
    },
  });

  return NextResponse.json({
    ok: true,
    commitSha,
    htmlUrl,
  });
}

