import { defineCollection, reference, type SchemaContext } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";
import { existsSync } from "node:fs";
import { join } from "node:path";

/* ---------------------------------------------------------------
 * Shared building blocks (reused by blog + projects)
 * ------------------------------------------------------------- */

/** A downloadable file. `file` is a path inside /public or an absolute URL. */
const attachment = z
  .object({
    title: z.string(),
    file: z.string(),
    description: z.string().optional(),
  })
  .refine(
    (a) => /^https?:\/\//.test(a.file) || existsSync(join(process.cwd(), "public", a.file)),
    { message: "Attachment file not found in /public", path: ["file"] },
  );

const galleryImage = ({ image }: SchemaContext) =>
  z.object({
    src: image(),
    alt: z.string(),
    caption: z.string().optional(),
  });

/** Fields every long-form entry (blog post, project) has. */
const entryBase = (ctx: SchemaContext) =>
  z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    cover: ctx.image().optional(),
    coverAlt: z.string().default(""),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    /** Show the table of contents (auto-generated from h2/h3). */
    toc: z.boolean().default(true),
    gallery: z.array(galleryImage(ctx)).default([]),
    attachments: z.array(attachment).default([]),
  });

/* ---------------------------------------------------------------
 * Long-form collections
 * ------------------------------------------------------------- */

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: (ctx) => entryBase(ctx),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: (ctx) =>
    entryBase(ctx).extend({
      status: z.enum(["completed", "ongoing", "archived"]).default("completed"),
      role: z.string().optional(),
      client: z.string().optional(),
      location: z.string().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      links: z
        .array(z.object({ label: z.string(), href: z.string() }))
        .default([]),
    }),
});

/* ---------------------------------------------------------------
 * Resume data collections (YAML files, one entry per list item)
 * ------------------------------------------------------------- */

const employment = defineCollection({
  loader: file("./src/content/data/employment.yaml"),
  schema: ({ image }) =>
    z.object({
      organization: z.string(),
      role: z.string(),
      type: z.enum(["Full-time", "Part-time", "Contract", "Internship", "Leadership", "Volunteer"]),
      location: z.string().optional(),
      url: z.url().optional(),
      logo: image().optional(),
      start: z.coerce.date(),
      end: z.coerce.date().optional(),
      summary: z.string().optional(),
      highlights: z.array(z.string()).default([]),
      skills: z.array(z.string()).default([]),
    }),
});

const education = defineCollection({
  loader: file("./src/content/data/education.yaml"),
  schema: ({ image }) =>
    z.object({
      institution: z.string(),
      campus: z.string().optional(),
      degree: z.string(),
      field: z.string().optional(),
      concentration: z.string().optional(),
      location: z.string().optional(),
      logo: image().optional(),
      start: z.coerce.date().optional(),
      end: z.coerce.date().optional(),
      grade: z.string().optional(),
      summary: z.string().optional(),
      highlights: z.array(z.string()).default([]),
      /** Link to entries in the projects collection by id. */
      projects: z.array(reference("projects")).default([]),
    }),
});

const certifications = defineCollection({
  loader: file("./src/content/data/certifications.yaml"),
  schema: z.object({
    title: z.string(),
    issuer: z.string(),
    type: z.enum(["Certification", "Training", "Workshop", "Conference", "Award"]),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    credentialId: z.string().optional(),
    credentialUrl: z.url().optional(),
    /** Certificate scan in /public (PDF or image). */
    file: z.string().optional(),
    skills: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, projects, employment, education, certifications };
