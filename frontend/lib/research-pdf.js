import "server-only";

const FETCH_TIMEOUT_MS = 4500;
const REVALIDATE_SECONDS = 60 * 60 * 24;

function normalizeDoi(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "");
}

function normalizePdfUrl(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(String(value).trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "PortfolioResearchPdfResolver/1.0 (https://smshagor.com)",
      },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function pickOpenAlexPdf(data) {
  const candidates = [
    data?.best_oa_location?.pdf_url,
    data?.primary_location?.pdf_url,
    ...(Array.isArray(data?.locations) ? data.locations.map((location) => location?.pdf_url) : []),
  ];

  for (const candidate of candidates) {
    const normalized = normalizePdfUrl(candidate);
    if (normalized) {
      return { url: normalized, source: "OpenAlex" };
    }
  }

  return null;
}

function pickCrossrefPdf(data) {
  const links = Array.isArray(data?.message?.link) ? data.message.link : [];
  const preferred = links.find((item) => {
    const contentType = String(item?.["content-type"] || "").toLowerCase();
    const url = String(item?.URL || "").toLowerCase();
    return contentType.includes("pdf") || /\.pdf(?:$|[?#])/.test(url);
  });
  const normalized = normalizePdfUrl(preferred?.URL);
  return normalized ? { url: normalized, source: "Crossref" } : null;
}

export async function resolveResearchPdf(doi, publication = {}) {
  const normalizedDoi = normalizeDoi(doi);

  for (const directCandidate of [publication?.pdfUrl, publication?.publicationUrl, publication?.citationUrl]) {
    const normalized = normalizePdfUrl(directCandidate);
    if (normalized && /\.pdf(?:$|[?#])/i.test(normalized)) {
      return { url: normalized, source: "Publication record" };
    }
  }

  if (!normalizedDoi) {
    return null;
  }

  const [openAlexResult, crossrefResult] = await Promise.all([
    fetchJson(`https://api.openalex.org/works/https://doi.org/${encodeURI(normalizedDoi)}`),
    fetchJson(`https://api.crossref.org/works/${encodeURIComponent(normalizedDoi)}`),
  ]);

  return pickOpenAlexPdf(openAlexResult) || pickCrossrefPdf(crossrefResult) || null;
}
