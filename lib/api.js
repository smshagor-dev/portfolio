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

export async function getBlogs() {
  return fetchFromBackend("/api/site/blogs");
}
