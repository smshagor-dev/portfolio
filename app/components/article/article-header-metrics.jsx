"use client";

import { useEffect, useState } from "react";
import { buildPublicApiUrl } from "@/lib/public-backend-url";

function MetricRow({ title, value, children }) {
  return (
    <div
      title={title}
      className="flex items-center justify-between rounded-[1rem] border border-[#24344d] bg-[#0d1728] px-4 py-3"
    >
      <span className="inline-flex items-center gap-2 text-sm text-[#9fb1c7]">
        <span className="text-[#8fdcff]">{children}</span>
        <span>{title}</span>
      </span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function MetricPill({ title, value, children }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#35506f] bg-[linear-gradient(180deg,#11253a,#0d1a2b)] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#cfe5f7] shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
    >
      <span className="text-[#8fdcff]">{children}</span>
      <span>{value}</span>
    </span>
  );
}

export default function ArticleHeaderMetrics({
  articleSlug,
  views = 0,
  impressions = 0,
  discussionCount = 0,
  shares = 0,
  variant = "rows",
}) {
  const [impressionDelta, setImpressionDelta] = useState(0);
  const [shareDelta, setShareDelta] = useState(0);

  useEffect(() => {
    if (!articleSlug || typeof window === "undefined") {
      return;
    }

    const sessionKey = `article-header-impression:${articleSlug}`;
    if (window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    window.sessionStorage.setItem(sessionKey, "1");

    fetch(buildPublicApiUrl(`/api/site/articles/${encodeURIComponent(articleSlug)}/impression`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to track impression.");
        }

        setImpressionDelta(1);
      })
      .catch(() => {
        window.sessionStorage.removeItem(sessionKey);
      });
  }, [articleSlug]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleShare(event) {
      if (event.detail?.articleSlug !== articleSlug) {
        return;
      }

      setShareDelta((current) => current + 1);
    }

    window.addEventListener("article:share-tracked", handleShare);
    return () => window.removeEventListener("article:share-tracked", handleShare);
  }, [articleSlug]);

  const MetricComponent = variant === "compact" ? MetricPill : MetricRow;
  const containerClass = variant === "compact" ? "flex flex-wrap items-center gap-3" : "space-y-3";

  return (
    <div className={containerClass}>
      <MetricComponent title="Views" value={views || 0}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
          <path
            d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      </MetricComponent>
      <MetricComponent title="Impressions" value={(impressions || 0) + impressionDelta}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
          <path d="M4 16.5 9.5 11l3.5 3.5L20 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.5 7.5H20v4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </MetricComponent>
      <MetricComponent title="Discussion" value={discussionCount || 0}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
          <path d="M7 10h10M7 14h6" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M6 19.5V18a3 3 0 0 0-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-3 1.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </MetricComponent>
      <MetricComponent title="Shares" value={(shares || 0) + shareDelta}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.4 11 7.2-4.2M8.4 13l7.2 4.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </MetricComponent>
    </div>
  );
}
