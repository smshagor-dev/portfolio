const DEFAULT_BACKEND_URL = "http://127.0.0.1:5000";

function getBackendUrl() {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    DEFAULT_BACKEND_URL
  );
}

async function fetchFromBackend(pathname) {
  const response = await fetch(`${getBackendUrl()}${pathname}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${pathname}`);
  }

  return response.json();
}

export async function getHomePageData() {
  return fetchFromBackend("/api/site/home");
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

export async function getServicesPageData() {
  return fetchFromBackend("/api/site/services");
}

export async function getServiceDetailData(slug) {
  return fetchFromBackend(`/api/site/services/${encodeURIComponent(slug)}`);
}
