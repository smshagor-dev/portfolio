import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "react-toastify/dist/ReactToastify.css";
import "ckeditor5/ckeditor5.css";
import { getHomePageData, getSiteSettings } from "@/lib/api";
import Footer from "./components/footer";
import AdCodeSlot from "./components/ad-code-slot";
import BrowserNotificationBootstrap from "./components/browser-notification-bootstrap";
import ContentLiveRefresh from "./components/content-live-refresh";
import LayoutClientChrome from "./components/layout-client-chrome";
import LayoutShell from "./components/layout-shell";
import LiveTicketDock from "./components/live-ticket-dock";
import PageLoadOverlay from "./components/page-load-overlay";
import SiteAnalyticsTracker from "./components/site-analytics-tracker";
import "./css/card.scss";
import "./css/globals.scss";

export const dynamic = "force-dynamic";

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
  const emergencyContacts = homeData?.emergencyContacts || [];
  const siteSettings = settings || homeData?.siteSettings || null;
  const googleTagManagerId =
    siteSettings?.googleTagManagerId || process.env.NEXT_PUBLIC_GTM || undefined;
  const googleAnalyticsId =
    siteSettings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID || undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LayoutShell
          footer={<Footer key="layout-footer" profile={profile} settings={siteSettings} />}
          navbar={<LayoutClientChrome key="layout-navbar" kind="navbar" profile={profile} settings={siteSettings} emergencyContacts={emergencyContacts} />}
          scrollToTop={<LayoutClientChrome key="layout-scroll-to-top" kind="scrollToTop" />}
          pageTopAdCode={siteSettings?.adsensePageTopCode}
          pageBottomAdCode={siteSettings?.adsensePageBottomCode}
        >
          <div key="layout-content">
            <PageLoadOverlay />
            <BrowserNotificationBootstrap />
            <LayoutClientChrome kind="toast" />
            <AdCodeSlot code={siteSettings?.adsenseHeadCode} className="hidden" label="Head Script" />
            <SiteAnalyticsTracker />
            <ContentLiveRefresh />
            <LiveTicketDock emergencyContacts={emergencyContacts} websiteTitle={siteSettings?.websiteTitle || siteSettings?.seoTitle || "Portfolio Website"} />
            {children}
          </div>
        </LayoutShell>
        {googleTagManagerId ? <GoogleTagManager gtmId={googleTagManagerId} /> : null}
        {googleAnalyticsId ? <GoogleAnalytics gaId={googleAnalyticsId} /> : null}
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
