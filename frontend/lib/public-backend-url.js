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

export function getSocketServerUrl() {
  if (configuredPublicBackendUrl) {
    return configuredPublicBackendUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return undefined;
}
