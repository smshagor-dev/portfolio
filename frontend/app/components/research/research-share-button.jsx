"use client";

import { buildPublicApiUrl } from "@/lib/public-backend-url";

export default function ResearchShareButton({ publicationSlug, canonicalUrl }) {
  async function trackShare() {
    try {
      await fetch(buildPublicApiUrl(`/api/research-publications/${encodeURIComponent(publicationSlug)}/share`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("research:share-tracked", {
            detail: { publicationSlug },
          }),
        );
      }
    } catch (_error) {
      // Ignore share tracking failures.
    }
  }

  return (
    <button
      type="button"
      onClick={async () => {
        const fallbackText = canonicalUrl;
        if (typeof navigator !== "undefined" && navigator.share) {
          try {
            await navigator.share({ url: canonicalUrl });
            await trackShare();
            return;
          } catch (_error) {
            // Fall back to clipboard below.
          }
        }

        try {
          await navigator.clipboard.writeText(fallbackText);
          await trackShare();
        } catch (_error) {
          // Ignore clipboard failures.
        }
      }}
      className="inline-flex items-center justify-center rounded-full border border-[#35516f] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
    >
      Share
    </button>
  );
}
