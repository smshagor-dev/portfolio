"use client";

import { useEffect, useRef } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login/admin";
}

function appendMarkup(container, code) {
  container.innerHTML = "";

  const template = document.createElement("template");
  template.innerHTML = code;
  const fragment = template.content.cloneNode(true);
  const scripts = Array.from(fragment.querySelectorAll("script"));

  for (const script of scripts) {
    const replacement = document.createElement("script");

    for (const attribute of script.attributes) {
      replacement.setAttribute(attribute.name, attribute.value);
    }

    replacement.textContent = script.textContent;
    script.parentNode?.replaceChild(replacement, script);
  }

  container.appendChild(fragment);
}

export default function AdCodeSlot({ code, className = "", label = "Advertisement" }) {
  const containerRef = useRef(null);
  const pathname = usePathname();
  const normalizedCode = String(code || "").trim();
  const [shouldRenderCode, setShouldRenderCode] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !normalizedCode) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldRenderCode(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "300px 0px",
      },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [normalizedCode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (!normalizedCode || !shouldRenderCode) {
      container.innerHTML = "";
      return;
    }

    appendMarkup(container, normalizedCode);

    return () => {
      container.innerHTML = "";
    };
  }, [normalizedCode, shouldRenderCode]);

  if (!normalizedCode || isAdminPath(pathname || "")) {
    return null;
  }

  return (
    <section className={className}>
      <div className="rounded-[1.75rem] border border-[#203049] bg-[#0a1322] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:p-5">
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.26em] text-[#6d88a7]">
          {label}
        </p>
        <div
          ref={containerRef}
          suppressHydrationWarning
          className={!shouldRenderCode ? "min-h-[120px]" : undefined}
        />
      </div>
    </section>
  );
}
