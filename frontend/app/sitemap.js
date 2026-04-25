import { getArticles, getHomePageData, getPricingPageData, getServicesPageData, getSiteSettings } from "@/lib/api";

function normalizeUrl(baseUrl, path = "") {
  return `${String(baseUrl || "http://localhost:3000").replace(/\/$/, "")}${path}`;
}

export default async function sitemap() {
  const [settings, homeData, pricingData, servicesData, articles] = await Promise.all([
    getSiteSettings().catch(() => null),
    getHomePageData().catch(() => null),
    getPricingPageData().catch(() => null),
    getServicesPageData().catch(() => null),
    getArticles().catch(() => []),
  ]);

  const baseUrl = settings?.canonicalUrl || "http://localhost:3000";
  const now = new Date();
  const items = [
    "",
    "/portfolio",
    "/service",
    "/pricing",
    "/contact",
    "/blog",
    "/artical",
  ].map((path) => ({
    url: normalizeUrl(baseUrl, path),
    lastModified: now,
  }));

  const projectItems = (homeData?.projects || []).map((project) => ({
    url: normalizeUrl(baseUrl, `/project/${project.slug}`),
    lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
  }));

  const serviceItems = (servicesData?.services || []).map((service) => ({
    url: normalizeUrl(baseUrl, `/service/${service.slug}`),
    lastModified: service.updatedAt ? new Date(service.updatedAt) : now,
  }));

  const pricingItems = (pricingData?.pricings || []).map((pricing) => ({
    url: normalizeUrl(baseUrl, `/pricing/${pricing.slug}`),
    lastModified: pricing.updatedAt ? new Date(pricing.updatedAt) : now,
  }));

  const articleItems = (articles || []).map((article) => ({
    url: normalizeUrl(baseUrl, `/artical/${article.slug}`),
    lastModified: article.updatedAt ? new Date(article.updatedAt) : article.publishDate ? new Date(article.publishDate) : now,
  }));

  return [...items, ...projectItems, ...serviceItems, ...pricingItems, ...articleItems];
}
