"use client";

import { useEffect, useRef, useState } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function MetricItem({ title, value, children }) {
  return (
    <span
      title={title}
      className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-[#2d425d] bg-[#0d1728] px-3 text-xs font-semibold text-[#c9d8e8] transition group-hover:border-[#46688f]"
    >
      <span className="text-[#8fdcff]">{children}</span>
      <span>{value}</span>
    </span>
  );
}

export default function ArticleCardMetrics({
  slug,
  views = 0,
  impressions = 0,
  discussionCount = 0,
  shares = 0,
  className = "",
}) {
  const cardRef = useRef(null);
  const [impressionDelta, setImpressionDelta] = useState(0);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || !slug || typeof window === "undefined") {
      return;
    }

    const sessionKey = `article-impression:${slug}`;
    if (window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }

        window.sessionStorage.setItem(sessionKey, "1");
        fetch(`${backendUrl}/api/site/articles/${encodeURIComponent(slug)}/impression`, {
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

        observer.disconnect();
      },
      {
        threshold: 0.4,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [slug]);

  return (
    <div ref={cardRef} className={`flex flex-wrap items-center gap-2 ${className}`}>
      <MetricItem title="Views" value={views || 0}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
          <path
            d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      </MetricItem>
      <MetricItem title="Impressions" value={(impressions || 0) + impressionDelta}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
          <path d="M4 16.5 9.5 11l3.5 3.5L20 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.5 7.5H20v4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </MetricItem>
      <MetricItem title="Comment" value={discussionCount || 0}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
          <path d="M7 10h10M7 14h6" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M6 19.5V18a3 3 0 0 0-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-3 1.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </MetricItem>
      <MetricItem title="Shares" value={shares || 0}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.4 11 7.2-4.2M8.4 13l7.2 4.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </MetricItem>
    </div>
  );
}
