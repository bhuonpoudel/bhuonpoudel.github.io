/**
 * Components available in every MDX file without importing them.
 * Passed to <Content components={mdxComponents} /> in EntryLayout.
 */
import Callout from "./Callout.astro";
import Figure from "./Figure.astro";
import Gallery from "@/components/content/Gallery.astro";
import Attachments from "@/components/content/Attachments.astro";

export const mdxComponents = { Callout, Figure, Gallery, Attachments };
