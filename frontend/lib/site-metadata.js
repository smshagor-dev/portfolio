function buildAbsoluteUrl(baseUrl, assetPath) {
  if (!assetPath) {
    return undefined;
  }

  try {
    return new URL(assetPath, baseUrl).toString();
  } catch (_error) {
    return undefined;
  }
}

function getMetadataBase(settings) {
  if (!settings?.canonicalUrl) {
    return undefined;
  }

  try {
    return new URL(settings.canonicalUrl);
  } catch (_error) {
    return undefined;
  }
}

export function buildPageMetadata(settings, options = {}) {
  const metadataBase = getMetadataBase(settings);
  const siteTitle = settings?.websiteTitle || "Portfolio Website";
  const title = options.title ? `${options.title} | ${siteTitle}` : settings?.seoTitle || siteTitle;
  const description =
    options.description || settings?.seoDescription || settings?.websiteDescription || siteTitle;
  const canonicalPath = options.path || "/";
  const canonicalUrl = settings?.canonicalUrl
    ? `${String(settings.canonicalUrl).replace(/\/$/, "")}${canonicalPath}`
    : canonicalPath;
  const imageUrl = buildAbsoluteUrl(
    settings?.canonicalUrl,
    options.image || settings?.seoImage || settings?.websiteIcon,
  );

  return {
    metadataBase,
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteTitle,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}
