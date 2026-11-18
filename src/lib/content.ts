import { getCollection, type CollectionEntry } from "astro:content";
import type { GetStaticPathsOptions } from "astro";
import { siteConfig } from "@/config/site";

/** Collections that share the long-form "entry" schema (cover, toc, gallery…). */
export type EntryCollection = "blog" | "projects";
export type Entry<C extends EntryCollection = EntryCollection> = CollectionEntry<C>;

export const collectionMeta: Record<
  EntryCollection,
  { label: string; singular: string; basePath: string; description: string }
> = {
  blog: {
    label: "Blog",
    singular: "Post",
    basePath: "/blog",
    description: "Notes, field reports and explainers on agricultural engineering, water and energy.",
  },
  projects: {
    label: "Projects",
    singular: "Project",
    basePath: "/projects",
    description: "Design, research and field work across irrigation, renewable energy and protected farming.",
  },
};

/** Published entries (drafts visible only in dev), newest first. */
export async function getPublished<C extends EntryCollection>(collection: C): Promise<Entry<C>[]> {
  const entries = (await getCollection(collection, ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  )) as Entry<C>[];
  return entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getFeatured<C extends EntryCollection>(collection: C, limit = 3) {
  const entries = await getPublished(collection);
  const featured = entries.filter((e) => e.data.featured);
  return (featured.length ? featured : entries).slice(0, limit);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export type TagCount = { name: string; slug: string; count: number };

/** All tags of a collection with counts, most-used first. */
export function getTags(entries: Entry[]): TagCount[] {
  const map = new Map<string, TagCount>();
  for (const entry of entries) {
    for (const name of entry.data.tags) {
      const slug = slugify(name);
      const existing = map.get(slug);
      if (existing) existing.count++;
      else map.set(slug, { name, slug, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function entryHref(collection: EntryCollection, id: string) {
  return `${collectionMeta[collection].basePath}/${id}`;
}

export function tagHref(collection: EntryCollection, tag: string) {
  return `${collectionMeta[collection].basePath}/tag/${slugify(tag)}`;
}

/* ---------------------------------------------------------------
 * getStaticPaths builders — keep the route files tiny and identical
 * for every long-form collection.
 * ------------------------------------------------------------- */

export function listingPaths(collection: EntryCollection) {
  return async ({ paginate }: GetStaticPathsOptions) => {
    const entries = await getPublished(collection);
    const tags = getTags(entries);
    return paginate(entries, {
      pageSize: siteConfig.pageSize[collection],
      props: { tags, total: entries.length },
    });
  };
}

export function tagListingPaths(collection: EntryCollection) {
  return async ({ paginate }: GetStaticPathsOptions) => {
    const entries = await getPublished(collection);
    const tags = getTags(entries);
    return tags.flatMap((tag) => {
      const tagged = entries.filter((e) => e.data.tags.some((t) => slugify(t) === tag.slug));
      return paginate(tagged, {
        pageSize: siteConfig.pageSize[collection],
        params: { tag: tag.slug },
        props: { tags, activeTag: tag, total: entries.length },
      });
    });
  };
}

export function entryPaths(collection: EntryCollection) {
  return async () => {
    const entries = await getPublished(collection);
    return entries.map((entry, i) => ({
      params: { slug: entry.id },
      props: {
        entry,
        // entries are newest-first: "next" is the newer one
        newer: entries[i - 1] ?? null,
        older: entries[i + 1] ?? null,
      },
    }));
  };
}

/** Rough reading time from the raw markdown body. */
export function readingTime(body = "") {
  const words = body.replace(/<[^>]*>|[#*_`>\-[\]()!]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
