import { getCollection } from "astro:content";

/** Most recent first; current roles (no end date) on top. */
const byRecency = <T extends { data: { start?: Date; end?: Date } }>(a: T, b: T) =>
  (b.data.end?.valueOf() ?? Infinity) - (a.data.end?.valueOf() ?? Infinity) ||
  (b.data.start?.valueOf() ?? 0) - (a.data.start?.valueOf() ?? 0);

export async function getEmployment() {
  return (await getCollection("employment")).sort(byRecency);
}

export async function getEducation() {
  return (await getCollection("education")).sort(byRecency);
}

export async function getCertifications() {
  return (await getCollection("certifications")).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Professional (non-leadership/volunteer) experience in months.
 * Counts distinct calendar months so overlapping roles aren't double counted.
 */
export async function getExperienceMonths() {
  const jobs = (await getEmployment()).filter((j) => !["Leadership", "Volunteer"].includes(j.data.type));
  const months = new Set<number>();
  const index = (d: Date) => d.getUTCFullYear() * 12 + d.getUTCMonth();
  for (const { data } of jobs) {
    for (let m = index(data.start); m <= index(data.end ?? new Date()); m++) months.add(m);
  }
  return months.size;
}
