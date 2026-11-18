/**
 * Class helpers for using shadcn/ui variants on plain elements in .astro files
 * (e.g. styling an <a> as a button). Runs the variant output through `cn` so
 * conflicting classes (border-transparent vs border-border) resolve correctly.
 */
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ButtonOpts = VariantProps<typeof buttonVariants> & { className?: string };
type BadgeOpts = VariantProps<typeof badgeVariants> & { className?: string };

export const buttonClass = ({ className, ...v }: ButtonOpts = {}) => cn(buttonVariants(v), className);
export const badgeClass = ({ className, ...v }: BadgeOpts = {}) => cn(badgeVariants(v), className);
