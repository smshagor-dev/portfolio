export function formatResearchDate(value, options = {}) {
  if (!value) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: options.compact ? "short" : "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function normalizeAuthors(authors) {
  if (!Array.isArray(authors)) {
    return [];
  }

  return authors
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

export function formatAuthors(authors) {
  const normalizedAuthors = normalizeAuthors(authors);
  if (!normalizedAuthors.length) {
    return "Authors not listed";
  }

  return normalizedAuthors.join(", ");
}

export function buildDoiUrl(doi) {
  const normalizedDoi = String(doi || "").trim();
  if (!normalizedDoi) {
    return "";
  }

  if (/^https?:\/\//i.test(normalizedDoi)) {
    return normalizedDoi;
  }

  return `https://doi.org/${normalizedDoi.replace(/^doi:\s*/i, "")}`;
}

export function getResearchStatusClasses(status) {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  if (normalizedStatus === "published") {
    return "border-[#2d6b55] bg-[#10281f] text-[#89f0c0]";
  }

  if (normalizedStatus === "under_review") {
    return "border-[#6b5d2d] bg-[#261f10] text-[#ffe18a]";
  }

  if (normalizedStatus === "draft") {
    return "border-[#3a4e69] bg-[#101d2b] text-[#9fdcff]";
  }

  return "border-[#5a3340] bg-[#23131a] text-[#f7a7b7]";
}

export function toTitleCase(value) {
  return String(value || "")
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}
