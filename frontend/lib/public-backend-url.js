const configuredPublicBackendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL || "")
  .trim()
  .replace(/\/+$/, "");
const configuredAppUrl = String(process.env.NEXT_PUBLIC_APP_URL || "")
  .trim()
  .replace(/\/+$/, "");

function getOrigin(value) {
  try {
    return new URL(value).origin;
  } catch (_error) {
    return "";
  }
}

function shouldUseAppProxy(pathname) {
  return pathname.startsWith("/api/") || pathname.startsWith("/uploads/");
}

export function getPublicBackendUrl() {
  return configuredPublicBackendUrl;
}

export function buildPublicApiUrl(pathname) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const appOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : getOrigin(configuredAppUrl);
  const backendOrigin = getOrigin(configuredPublicBackendUrl);

  if (shouldUseAppProxy(normalizedPathname) && appOrigin && appOrigin !== backendOrigin) {
    return `${appOrigin}${normalizedPathname}`;
  }

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

  if (normalizedPathname.startsWith("data:")) {
    return normalizedPathname;
  }

  if (/^https?:\/\//i.test(normalizedPathname)) {
    const appOrigin =
      typeof window !== "undefined"
        ? window.location.origin
        : getOrigin(configuredAppUrl);
    const backendOrigin = getOrigin(configuredPublicBackendUrl);

    try {
      const assetUrl = new URL(normalizedPathname);
      if (
        backendOrigin &&
        assetUrl.origin === backendOrigin &&
        shouldUseAppProxy(assetUrl.pathname)
      ) {
        return `${assetUrl.pathname}${assetUrl.search}${assetUrl.hash}`;
      }
    } catch (_error) {
      return normalizedPathname;
    }

    return normalizedPathname;
  }

  if (normalizedPathname.startsWith("/uploads/")) {
    const appOrigin =
      typeof window !== "undefined"
        ? window.location.origin
        : getOrigin(configuredAppUrl);
    const backendOrigin = getOrigin(configuredPublicBackendUrl);

    if (appOrigin && appOrigin !== backendOrigin) {
      return normalizedPathname;
    }

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
