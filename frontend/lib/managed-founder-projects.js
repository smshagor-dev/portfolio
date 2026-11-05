import { getFounderProjects } from "@/lib/api";
import { founderProjects } from "@/lib/founder-projects";

const ARRAY_FIELDS = ["role","focus","context","responsibilities","principles",
  "journey","decisions","delivered","ongoing","stack"];

export function normalizeFounderProject(project) {
  const original = founderProjects.find((item) => item.slug === project?.slug);
  const merged = { ...(original || {}), ...project };
  for (const key of ARRAY_FIELDS) {
    merged[key] = Array.isArray(merged[key]) ? merged[key] : [];
  }
  merged.imageWidth = Number(merged.imageWidth) > 0 ? Number(merged.imageWidth) : 1200;
  merged.imageHeight = Number(merged.imageHeight) > 0 ? Number(merged.imageHeight) : 645;
  merged.imageAlt ||= merged.name || "Founder project preview";
  merged.status = merged.status !== false;
  merged.sortOrder = Number(merged.sortOrder) || 0;
  return merged;
}

// Null/uninitialized data preserves the existing curated case studies. An
// explicit [] from the admin intentionally hides the section, not a fallback.
export async function getManagedFounderProjects() {
  try {
    const response = await getFounderProjects();
    if (response?.initialized && Array.isArray(response.data)) {
      return response.data.map(normalizeFounderProject)
        .filter((project) => project.status !== false)
        .sort((a,b) => a.sortOrder - b.sortOrder);
    }
  } catch (error) {
    console.error("Unable to load managed founder projects:", error.message);
  }
  return founderProjects.map(normalizeFounderProject);
}
