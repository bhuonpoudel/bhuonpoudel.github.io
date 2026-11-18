import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { siteConfig } from "@/config/site";
import { entryHref, getPublished } from "@/lib/content";

export async function GET(context: APIContext) {
  const posts = await getPublished("blog");
  return rss({
    title: `${siteConfig.name} | Blog`,
    description: siteConfig.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: entryHref("blog", post.id),
    })),
  });
}
