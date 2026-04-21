"use client";

import { useEffect, useState } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function StatPill({ label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-[#263a54] bg-[#0d1728]/90 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.3em] text-[#82d9ff]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function ServiceDetailStats({ serviceSlug, views = 0, impressions = 0, comments = 0 }) {
  const [impressionDelta, setImpressionDelta] = useState(0);

  useEffect(() => {
    if (!serviceSlug || typeof window === "undefined") {
      return;
    }

    const sessionKey = `service-detail-impression:${serviceSlug}`;
    if (window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    window.sessionStorage.setItem(sessionKey, "1");

    fetch(`${backendUrl}/api/site/services/${encodeURIComponent(serviceSlug)}/impression`, {
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
  }, [serviceSlug]);

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      <StatPill label="Views" value={views || 0} />
      <StatPill label="Impressions" value={(impressions || 0) + impressionDelta} />
      <StatPill label="Comments" value={comments || 0} />
    </div>
  );
}
