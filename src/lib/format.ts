import { statSync } from "node:fs";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

const dateFmt = new Intl.DateTimeFormat(siteConfig.locale, {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const monthFmt = new Intl.DateTimeFormat(siteConfig.locale, {
  year: "numeric",
  month: "short",
  timeZone: "UTC",
});

export const formatDate = (d: Date) => dateFmt.format(d);
export const formatMonth = (d: Date) => monthFmt.format(d);

/** "Feb 2025 – Present" style ranges. */
export function formatRange(start?: Date, end?: Date, presentLabel = "Present") {
  if (!start && !end) return "";
  if (!start) return formatMonth(end!);
  return `${formatMonth(start)} – ${end ? formatMonth(end) : presentLabel}`;
}

/** "1 yr 5 mos" between two dates (inclusive of the start month). */
export function formatDuration(start: Date, end: Date = new Date()) {
  const months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth()) + 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo${m > 1 ? "s" : ""}`].filter(Boolean).join(" ");
}

export function formatBytes(bytes: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

/** Size + extension for a file in /public (build-time only). */
export function fileInfo(path: string) {
  const ext = path.split(".").pop()?.toUpperCase() ?? "";
  if (/^https?:\/\//.test(path)) return { ext, size: "" };
  try {
    return { ext, size: formatBytes(statSync(join(process.cwd(), "public", path)).size) };
  } catch {
    return { ext, size: "" };
  }
}
