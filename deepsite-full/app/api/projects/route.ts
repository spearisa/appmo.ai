import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import slugify from "slugify";
import type { Options as SlugifyOptions } from "slugify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

const semverPattern = /^\d+\.\d+\.\d+$/;

const requestSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  html: z.string().min(1, "Generated HTML is required."),
  prompts: z.array(z.string()).default([]),
  slug: z.string().optional(),
  version: z
    .string()
    .trim()
    .refine((value) => semverPattern.test(value), {
      message: "Version must follow semver (e.g. 1.0.0).",
    })
    .optional(),
});

const slugOptions: SlugifyOptions = {
  lower: true,
  strict: true,
  trim: true,
};

const ensureUniqueSlug = async (ownerId: string, base: string) => {
  let candidate = base;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.project.findUnique({
      where: {
        ownerId_slug: {
          ownerId,
          slug: candidate,
        },
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "You must be signed in to save a project." },
      { status: 401 }
    );
  }

  const json = await request.json();
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { title, description, html, prompts, slug, version } = parsed.data;
  const ownerId = session.user.id;
  const baseSlug =
    slug?.trim() ||
    slugify(title.length > 0 ? title : "project", slugOptions) ||
    `project-${Date.now()}`;

  const preExistingProject = await prisma.project.findUnique({
    where: {
      ownerId_slug: {
        ownerId,
        slug: baseSlug,
      },
    },
  });

  const finalSlug = preExistingProject
    ? preExistingProject.slug
    : await ensureUniqueSlug(ownerId, baseSlug);

  const result = await prisma.$transaction(async (tx) => {
    const project = preExistingProject
      ? await tx.project.update({
          where: { id: preExistingProject.id },
          data: {
            title,
            description: description?.trim() || null,
            html,
            prompts,
            updatedAt: new Date(),
          },
        })
      : await tx.project.create({
          data: {
            ownerId,
            slug: finalSlug,
            title,
            description: description?.trim() || null,
            html,
            prompts,
          },
        });

    await tx.projectVersion.create({
      data: {
        projectId: project.id,
        html,
        prompts: prompts as Prisma.InputJsonValue,
        summary: version
          ? `Version ${version}`
          : prompts.length > 0
            ? prompts.at(-1)
            : `Updated ${title}`,
      },
    });

    return project;
  });

  return NextResponse.json({
    ok: true,
    project: {
      id: result.id,
      slug: result.slug,
      title: result.title,
      description: result.description,
      html: result.html,
      prompts: result.prompts,
      updatedAt: result.updatedAt,
    },
  });
}

