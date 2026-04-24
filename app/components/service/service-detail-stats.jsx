"use client";

import { useEffect, useState } from "react";
import { FiEye, FiMessageSquare, FiTrendingUp } from "react-icons/fi";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function StatPill({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[1.25rem] border border-[#263a54] bg-[#0d1728]/90 px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex items-center justify-center gap-2 sm:block">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#29405d] bg-[#11253a] text-[#8fdcff] sm:mb-3">
          <Icon size={16} />
        </span>
        <p className="text-lg font-semibold text-white sm:mt-2 sm:text-2xl">{value}</p>
      </div>
      <p className="hidden text-[11px] uppercase tracking-[0.3em] text-[#82d9ff] sm:block">{label}</p>
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
    <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
      <StatPill label="Views" value={views || 0} icon={FiEye} />
      <StatPill label="Impressions" value={(impressions || 0) + impressionDelta} icon={FiTrendingUp} />
      <StatPill label="Comments" value={comments || 0} icon={FiMessageSquare} />
    </div>
  );
}
