"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { getServiceIconOption } from "@/utils/service-icons";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function stripHtml(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function Metric({ children, value }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-[#8ea5bd]">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#273a54] bg-[#101a2b] text-[#8fdcff]">
        {children}
      </span>
      <span className="text-[#d5dfeb]">{value}</span>
    </span>
  );
}

export default function ServiceCard({ service, compact = false }) {
  const cardRef = useRef(null);
  const selectedIcon = getServiceIconOption(service?.icon);
  const ServiceIcon = selectedIcon.icon;

  useEffect(() => {
    const node = cardRef.current;
    if (!node || !service?.slug || typeof window === "undefined") {
      return;
    }

    const sessionKey = `service-impression:${service.slug}`;
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
        fetch(`${backendUrl}/api/site/services/${encodeURIComponent(service.slug)}/impression`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }).catch(() => {});
        observer.disconnect();
      },
      {
        threshold: 0.45,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [service?.slug]);

  return (
    <Link
      ref={cardRef}
      href={`/service/${service.slug}`}
      className={`group relative block h-full overflow-hidden rounded-[1.75rem] border border-[#23344c] bg-[linear-gradient(160deg,rgba(17,28,46,0.98),rgba(10,18,31,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.22)] transition duration-500 hover:-translate-y-1 hover:border-[#4f7397] hover:shadow-[0_30px_70px_rgba(0,0,0,0.3)] ${
        compact ? "p-5" : "p-6"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,218,181,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(112,213,255,0.16),transparent_34%)] opacity-80 transition duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#2b405b]" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px overflow-hidden">
        <div className="h-full w-24 -translate-x-32 bg-[linear-gradient(90deg,transparent,rgba(112,213,255,0.95),transparent)] transition duration-500 group-hover:translate-x-[18rem]" />
      </div>
      <div className="pointer-events-none absolute -right-12 top-0 h-32 w-32 rounded-full bg-[#6ad8ff]/10 blur-3xl transition duration-500 group-hover:translate-x-[-12px] group-hover:translate-y-[10px] group-hover:bg-[#6ad8ff]/20" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#7ff0bf]/10 blur-3xl transition duration-500 group-hover:translate-x-[10px] group-hover:translate-y-[-10px] group-hover:bg-[#7ff0bf]/18" />

      <div className="relative flex h-full flex-col">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2c4a6d] bg-[linear-gradient(180deg,#10253d,#0b1625)] text-[#8fdcff] transition duration-500 group-hover:rotate-[-4deg] group-hover:border-[#62cbff] group-hover:shadow-[0_18px_30px_rgba(74,180,255,0.18)]">
              <ServiceIcon size={20} />
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-[#7dd9ff]">Service</p>
            <h3 className={`mt-2 break-words font-semibold text-white transition duration-300 group-hover:text-[#9be3ff] ${compact ? "text-lg" : "text-xl"}`}>
              {service.name}
            </h3>
          </div>

          {service.isFeatured ? (
            <span className="self-start rounded-full border border-[#315a4b] bg-[#10241c] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#93f0c1]">
              Featured
            </span>
          ) : null}
        </div>

        <p className={`mt-5 flex-1 leading-7 text-[#c0cddd] transition duration-300 group-hover:text-[#dbe8f5] ${compact ? "line-clamp-3 text-sm" : "line-clamp-4 text-[15px]"}`}>
          {stripHtml(service.description)}
        </p>

        <div className="mt-6 flex flex-col items-start gap-4 border-t border-[#213147] pt-4 transition duration-300 group-hover:border-[#305173] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Metric value={service.comments?.length || 0}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
                <path d="M7 10h10M7 14h6" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M6 19.5V18a3 3 0 0 0-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-3 1.5Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Metric>
            <Metric value={service.views || 0}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
                <path
                  d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </Metric>
            <Metric value={service.impressionCount || 0}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
                <path
                  d="M4 6.5h16M6.5 3v7M17.5 3v7M5 10h14a2 2 0 0 1 2 2v5a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-5a2 2 0 0 1 2-2Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M8.5 14.5h7M8.5 17.5h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Metric>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-white transition group-hover:text-[#70d5ff]">
            Open service
            <span className="transition duration-300 group-hover:translate-x-1.5">-&gt;</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
