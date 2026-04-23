import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "ckeditor5/ckeditor5.css";
import { getHomePageData, getSiteSettings } from "@/lib/api";
import Footer from "./components/footer";
import LayoutClientChrome from "./components/layout-client-chrome";
import LayoutShell from "./components/layout-shell";
import LiveTicketDock from "./components/live-ticket-dock";
import SiteAnalyticsTracker from "./components/site-analytics-tracker";
import "./css/card.scss";
import "./css/globals.scss";
const inter = Inter({ subsets: ["latin"] });

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

export async function generateMetadata() {
  const settings = await getSiteSettings().catch(() => null);
  let metadataBase;

  if (settings?.canonicalUrl) {
    try {
      metadataBase = new URL(settings.canonicalUrl);
    } catch (_error) {
      metadataBase = undefined;
    }
  }
  const title = settings?.seoTitle || settings?.websiteTitle || "Portfolio Website";
  const description = settings?.seoDescription || settings?.websiteDescription || "Portfolio Website";
  const keywords = settings?.seoKeywords
    ? settings.seoKeywords.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
  const imageUrl = buildAbsoluteUrl(settings?.canonicalUrl, settings?.seoImage);
  const iconUrl = buildAbsoluteUrl(settings?.canonicalUrl, settings?.websiteIcon);

  return {
    metadataBase,
    title,
    description,
    keywords,
    alternates: {
      canonical: settings?.canonicalUrl || "/",
    },
    verification: {
      google: settings?.googleSiteVerification || undefined,
    },
    robots: {
      index: settings?.robotsIndexingEnabled ?? true,
      follow: settings?.robotsFollowEnabled ?? true,
    },
    openGraph: {
      title,
      description,
      url: settings?.canonicalUrl || "/",
      siteName: settings?.websiteTitle || title,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    icons: iconUrl
      ? {
          icon: iconUrl,
          shortcut: iconUrl,
          apple: iconUrl,
        }
      : undefined,
  };
}

export default async function RootLayout({ children }) {
  const [homeData, settings] = await Promise.all([
    getHomePageData().catch(() => null),
    getSiteSettings().catch(() => null),
  ]);
  const profile = homeData?.profile || null;
  const siteSettings = settings || homeData?.siteSettings || null;
  const googleTagManagerId =
    siteSettings?.googleTagManagerId || process.env.NEXT_PUBLIC_GTM || undefined;
  const googleAnalyticsId =
    siteSettings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID || undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <LayoutShell
          footer={<Footer profile={profile} settings={siteSettings} />}
          navbar={<LayoutClientChrome kind="navbar" profile={profile} settings={siteSettings} />}
          scrollToTop={<LayoutClientChrome kind="scrollToTop" />}
        >
          <LayoutClientChrome kind="toast" />
          <SiteAnalyticsTracker />
          <LiveTicketDock />
          {children}
        </LayoutShell>
        {googleTagManagerId ? <GoogleTagManager gtmId={googleTagManagerId} /> : null}
        {googleAnalyticsId ? <GoogleAnalytics gaId={googleAnalyticsId} /> : null}
      </body>
    </html>
  );
}
