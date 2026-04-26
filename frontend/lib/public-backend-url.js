const configuredPublicBackendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL || "")
  .trim()
  .replace(/\/+$/, "");

export function getPublicBackendUrl() {
  return configuredPublicBackendUrl;
}

export function buildPublicApiUrl(pathname) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (configuredPublicBackendUrl) {
    return `${configuredPublicBackendUrl}${normalizedPathname}`;
  }

  return normalizedPathname;
}

export function buildPublicAssetUrl(pathname) {
  const normalizedPathname = String(pathname || "").trim();

  if (!normalizedPathname) {
    return "";
  }

  if (/^https?:\/\//i.test(normalizedPathname) || normalizedPathname.startsWith("data:")) {
    return normalizedPathname;
  }

  if (normalizedPathname.startsWith("/uploads/")) {
    return buildPublicApiUrl(normalizedPathname);
  }

  return normalizedPathname;
}

export function getSocketServerUrl() {
  if (configuredPublicBackendUrl) {
    return configuredPublicBackendUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return undefined;
}
