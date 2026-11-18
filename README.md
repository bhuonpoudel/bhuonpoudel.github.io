# Bhuwan Prasad Poudel — Portfolio

Astro 7 · shadcn/ui (Base UI) · Tailwind CSS v4 · GSAP + Lenis · Pagefind · MDX

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Static build to `dist/` **and** Pagefind search index |
| `npm run preview` | Serve the production build |
| `npm run search:dev` | Build once and copy the search index into `public/` so search works in `npm run dev` |
| `npm run check` | Type-check `.astro`, `.ts` and `.tsx` files |

Before deploying, set the production URL (used for canonical links, sitemap and RSS) with the `SITE_URL` env var or in `astro.config.mjs`.
To make the contact form send messages, set `PUBLIC_CONTACT_ENDPOINT` to any JSON form endpoint (Formspree, Web3Forms…). Without it, the form opens the visitor's email app.

## Where things live

```
src/
  config/site.ts          ← name, bio, nav, socials, skills, page sizes
  config/theme.ts         ← colour palettes shown in the theme picker
  content.config.ts       ← schemas for every collection
  content/
    blog/*.mdx            ← blog posts
    projects/*.mdx        ← projects
    data/employment.yaml  ← jobs + leadership
    data/education.yaml
    data/certifications.yaml
  assets/                 ← images used by content (optimised at build)
public/files/             ← downloadable attachments, CV
```

## Writing a post or project

Create `src/content/blog/my-post.mdx` (or `projects/…`):

```mdx
---
title: My post
description: One-sentence summary used on cards, SEO and search.
pubDate: 2025-10-01
cover: ../../assets/blog/my-post/cover.jpg
coverAlt: What the image shows
tags: [Irrigation, Field Notes]
featured: true          # highlight on the home page
draft: false            # drafts show in dev only
toc: true               # table of contents from ## / ### headings
gallery:                # optional — rendered as a lightbox gallery
  - src: ../../assets/blog/my-post/site.jpg
    alt: Site overview
    caption: Optional caption
attachments:            # optional — files in /public or full URLs
  - title: Survey data
    file: /files/my-post/data.csv
    description: Raw data
---

## A heading

Body text. These components work without importing them:

<Callout type="tip" title="Heads up">Note, tip or warning.</Callout>
```

Projects also accept `status` (`completed | ongoing | archived`), `role`, `client`, `location`, `startDate`, `endDate` and `links: [{ label, href }]`.

Pagination, tag pages, search indexing, RSS and the sitemap all update on the next build.

## Theming

- **Mode**: light / dark / system, saved per visitor.
- **Palettes**: every colour token is derived from a hue/chroma pair in `src/styles/global.css`. To add one, add a `[data-palette="name"]` block there and register it in `src/config/theme.ts`.
- The default palette and mode are in `src/config/theme.ts`.

## Reusable building blocks

| Component | Use |
| --- | --- |
| `layouts/BaseLayout.astro` | HTML shell, SEO, header/footer, smooth scroll |
| `layouts/PageLayout.astro` | Inner page with a consistent header |
| `layouts/EntryLayout.astro` | Detail page for any long-form entry (cover, TOC, gallery, files) |
| `components/content/CollectionListing.astro` | Listing page: tag filter, grid, pagination |
| `components/content/{EntryCard,Gallery,Attachments,TableOfContents,PaginationNav,TagFilter}.astro` | Individual pieces |
| `components/resume/{Timeline,TimelineItem}.astro` | Experience / education timelines |
| `lib/content.ts` | `getPublished`, `listingPaths`, `tagListingPaths`, `entryPaths` route helpers |
| `lib/variants.ts` | `buttonClass` / `badgeClass` for styling links as shadcn buttons in `.astro` |

### Animation attributes

Any element can animate on scroll without writing JavaScript:

```html
<div data-reveal>…</div>                    <!-- fade + rise -->
<div data-reveal="left|right|fade|scale">…</div>
<div data-reveal data-reveal-delay="0.2">…</div>
<ul data-reveal-stagger>…</ul>              <!-- children animate in sequence -->
<button data-open-search>…</button>         <!-- opens the search dialog -->
```

All motion is turned off for visitors who prefer reduced motion.

## Sample content

The text, images and files in this repo were drafted from the CV as a starting point. Replace the placeholder covers and gallery images in `src/assets/` with real photos, and review all copy before publishing.
