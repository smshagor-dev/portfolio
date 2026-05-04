import Script from "next/script";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "react-toastify/dist/ReactToastify.css";
import { getHomePageData, getSiteSettings } from "@/lib/api";
import Footer from "./components/footer";
import AdCodeSlot from "./components/ad-code-slot";
import LayoutShell from "./components/layout-shell";
import DeferredClientFeatures from "./components/deferred-client-features";
import Navbar from "./components/navbar";
import ScrollToTop from "./components/helper/scroll-to-top";
import ToastProvider from "./components/toast-provider";
import SiteAnalyticsTracker from "./components/site-analytics-tracker";
import "./css/card.scss";
import "./css/globals.scss";

const sansFont = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const monoFont = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const revalidate = 300;

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
      <body
        suppressHydrationWarning
        className={`${sansFont.variable} ${monoFont.variable} ${serifFont.variable}`}
      >
        <LayoutShell
          footer={<Footer key="layout-footer" profile={profile} settings={siteSettings} />}
          navbar={<Navbar key="layout-navbar" profile={profile} settings={siteSettings} emergencyContacts={emergencyContacts} />}
          scrollToTop={<ScrollToTop key="layout-scroll-to-top" />}
          pageTopAdCode={siteSettings?.adsensePageTopCode}
          pageBottomAdCode={siteSettings?.adsensePageBottomCode}
        >
          <div key="layout-content">
            <ToastProvider />
            <AdCodeSlot code={siteSettings?.adsenseHeadCode} className="hidden" label="Head Script" />
            <SiteAnalyticsTracker />
            <DeferredClientFeatures
              emergencyContacts={emergencyContacts}
              websiteTitle={siteSettings?.websiteTitle || siteSettings?.seoTitle || "Portfolio Website"}
            />
            {children}
          </div>
        </LayoutShell>
        {googleTagManagerId ? (
          <>
            <Script id="gtm-loader" strategy="lazyOnload">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${googleTagManagerId}');
              `}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        ) : null}
        {googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="lazyOnload"
            />
            <Script id="ga-loader" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
