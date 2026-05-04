const DEFAULT_BACKEND_URL = "http://127.0.0.1:5000";

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function getBackendUrl() {
  return normalizeBaseUrl(
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    DEFAULT_BACKEND_URL
  );
}

function getAppUrl() {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.FRONTEND_URL
  );
}

function supportsFrontendProxy(pathname) {
  return (
    pathname.startsWith("/api/site/") ||
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/research-publications") ||
    pathname.startsWith("/api/assistant/") ||
    pathname.startsWith("/uploads/") ||
    pathname === "/health" ||
    pathname === "/ready"
  );
}

function getCandidateUrls(pathname) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const candidates = [];
  const backendUrl = getBackendUrl();
  const appUrl = getAppUrl();

  if (backendUrl) {
    candidates.push(`${backendUrl}${normalizedPathname}`);
  }

  if (appUrl && supportsFrontendProxy(normalizedPathname)) {
    candidates.push(`${appUrl}${normalizedPathname}`);
  }

  return Array.from(new Set(candidates));
}

async function fetchWithTimeout(targetUrl, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    return await fetch(targetUrl, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function toPublicAssetUrl(value) {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue.startsWith("/uploads/")) {
    return value;
  }

  return `${getBackendUrl()}${normalizedValue}`;
}

function mapBackendAssets(value) {
  if (Array.isArray(value)) {
    return value.map(mapBackendAssets);
  }

  if (!value || typeof value !== "object") {
    return typeof value === "string" ? toPublicAssetUrl(value) : value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, mapBackendAssets(item)]),
  );
}

async function fetchFromBackend(pathname) {
  const targetUrls = getCandidateUrls(pathname);
  const failures = [];

  for (const targetUrl of targetUrls) {
    try {
      const response = await fetchWithTimeout(targetUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        failures.push(
          `${response.status} ${response.statusText} via ${targetUrl}${
            responseText ? ` :: ${responseText.slice(0, 200)}` : ""
          }`,
        );
        continue;
      }

      return mapBackendAssets(await response.json());
    } catch (error) {
      failures.push(`${error.message} via ${targetUrl}`);
    }
  }

  throw new Error(
    `Backend request failed: ${pathname}${
      failures.length ? ` :: ${failures.join(" || ")}` : ""
    }`,
  );
}

export async function getHomePageData() {
  return fetchFromBackend("/api/site/home");
}

export async function getSiteSettings() {
  return fetchFromBackend("/api/site/settings");
}

export async function getPricingPageData() {
  return fetchFromBackend("/api/site/pricing");
}

export async function getPricingDetailData(slug) {
  return fetchFromBackend(`/api/site/pricing/${encodeURIComponent(slug)}`);
}

export async function getProjectDetailData(slug) {
  return fetchFromBackend(`/api/site/projects/${encodeURIComponent(slug)}`);
}

export async function getBlogs() {
  return fetchFromBackend("/api/site/blogs");
}

export async function getArticles() {
  return fetchFromBackend("/api/site/articles");
}

export async function getArticleDetailData(slug) {
  return fetchFromBackend(`/api/site/articles/${encodeURIComponent(slug)}`);
}

export async function getServicesPageData() {
  return fetchFromBackend("/api/site/services");
}

export async function getServiceDetailData(slug) {
  return fetchFromBackend(`/api/site/services/${encodeURIComponent(slug)}`);
}

export async function getResearchPublications(query = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value == null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const pathname = `/api/research-publications${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  return fetchFromBackend(pathname);
}

export async function getFeaturedResearchPublications() {
  return fetchFromBackend("/api/research-publications/featured");
}

export async function getResearchPublicationDetail(slug) {
  return fetchFromBackend(`/api/research-publications/${encodeURIComponent(slug)}`);
}
