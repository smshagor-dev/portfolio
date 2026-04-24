"use client";

import { useMemo, useState } from "react";
import {
  FaEnvelope,
  FaFacebookF,
  FaLinkedinIn,
  FaPinterestP,
  FaRedditAlien,
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function buildShareUrl(template, pageUrl, title) {
  return template
    .replace("{url}", encodeURIComponent(pageUrl))
    .replace("{title}", encodeURIComponent(title));
}

const sharePlatforms = [
  {
    id: "facebook",
    label: "Facebook",
    icon: FaFacebookF,
    color: "hover:border-[#5b88ff] hover:text-[#9dbcff]",
    template: "https://www.facebook.com/sharer/sharer.php?u={url}",
  },
  {
    id: "x",
    label: "X",
    icon: FaXTwitter,
    color: "hover:border-[#9aa6b2] hover:text-white",
    template: "https://twitter.com/intent/tweet?url={url}&text={title}",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedinIn,
    color: "hover:border-[#4ca0ff] hover:text-[#8ec9ff]",
    template: "https://www.linkedin.com/sharing/share-offsite/?url={url}",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: FaWhatsapp,
    color: "hover:border-[#3fd38d] hover:text-[#7df0b7]",
    template: "https://wa.me/?text={title}%20{url}",
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: FaTelegramPlane,
    color: "hover:border-[#57b8ff] hover:text-[#8fdcff]",
    template: "https://t.me/share/url?url={url}&text={title}",
  },
  {
    id: "reddit",
    label: "Reddit",
    icon: FaRedditAlien,
    color: "hover:border-[#ff7e47] hover:text-[#ffb08f]",
    template: "https://www.reddit.com/submit?url={url}&title={title}",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    icon: FaPinterestP,
    color: "hover:border-[#ff678a] hover:text-[#ffb3c3]",
    template: "https://pinterest.com/pin/create/button/?url={url}&description={title}",
  },
  {
    id: "email",
    label: "Email",
    icon: FaEnvelope,
    color: "hover:border-[#ffd36f] hover:text-[#ffe29d]",
    template: "mailto:?subject={title}&body={url}",
  },
];

export default function ArticleShareStrip({ title, canonicalUrl, articleSlug }) {
  const [copied, setCopied] = useState(false);

  const platforms = useMemo(
    () =>
      sharePlatforms.map((platform) => ({
        ...platform,
        href: buildShareUrl(platform.template, canonicalUrl, title),
      })),
    [canonicalUrl, title],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      trackShare();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (_error) {
      setCopied(false);
    }
  }

  function trackShare() {
    if (!articleSlug) {
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/site/articles/${encodeURIComponent(articleSlug)}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to track share.");
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("article:share-tracked", { detail: { articleSlug } }));
        }
      })
      .catch(() => {});
  }

  return (
    <div className="mt-10 rounded-[1.75rem] border border-[#24344d] bg-[linear-gradient(180deg,#0f1a2c,#0a1321)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Share This Article</p>
          <p className="mt-2 text-sm leading-7 text-[#bfd0e2]">
            Open your preferred social platform directly and share this post instantly.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-[#35506f] bg-[#11253a] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#9fe3ff]"
        >
          {copied ? "Link Copied" : "Copy Link"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {platforms.map((platform) => {
          const Icon = platform.icon;

          return (
            <a
              key={platform.id}
              href={platform.href}
              onClick={trackShare}
              target={platform.id === "email" ? undefined : "_blank"}
              rel={platform.id === "email" ? undefined : "noreferrer"}
              aria-label={`Share on ${platform.label}`}
              title={platform.label}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#29405d] bg-[#0d1728] text-[#c8d7e7] transition ${platform.color}`}
            >
              <Icon size={18} />
            </a>
          );
        })}
      </div>
    </div>
  );
}
