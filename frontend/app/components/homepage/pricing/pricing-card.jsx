import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import OpenChatButton from "@/app/components/open-chat-button";

function formatPrice(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Custom";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PricingCard({ plan, compact = false }) {
  const featureCount = Array.isArray(plan?.features) ? plan.features.length : 0;

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.9rem] border transition duration-300 ${
        plan?.isPopular
          ? "border-[#5f6b34] bg-[linear-gradient(160deg,rgba(35,30,15,0.98),rgba(14,18,27,0.98))] shadow-[0_28px_75px_rgba(0,0,0,0.32)]"
          : "border-[#24344d] bg-[linear-gradient(160deg,rgba(17,28,46,0.98),rgba(10,18,31,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
      } ${compact ? "h-full p-5" : "h-full p-7"} hover:-translate-y-1 hover:border-[#6f9ac8] hover:shadow-[0_32px_80px_rgba(0,0,0,0.3)]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(112,213,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(122,218,181,0.14),transparent_34%)] opacity-90 transition duration-300 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="shrink-0">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#35597f] bg-[linear-gradient(180deg,#10253d,#0b1625)] text-[#8fdcff]">
                {plan?.isPopular ? <Sparkles size={20} /> : <BadgeCheck size={20} />}
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-[#7dd9ff]">
                {plan?.duration || "Flexible"}
              </p>
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <h3 className={`break-words font-semibold text-white ${compact ? "text-xl" : "text-2xl"}`}>
                {plan?.name || "Pricing Plan"}
              </h3>

              {plan?.isPopular ? (
                <span className="mt-3 inline-flex self-start rounded-full border border-[#6a6230] bg-[#2b2611] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#ffe08a] sm:hidden">
                  Most Popular
                </span>
              ) : null}
            </div>
          </div>

          {plan?.isPopular ? (
            <span className="hidden self-start rounded-full border border-[#6a6230] bg-[#2b2611] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#ffe08a] sm:inline-flex">
              Most Popular
            </span>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-2 sm:gap-3">
          <p className={`${compact ? "text-[2.2rem] sm:text-4xl" : "text-4xl sm:text-5xl"} font-semibold tracking-tight text-white`}>
            {formatPrice(plan?.price)}
          </p>
          <p className="pb-2 text-sm uppercase tracking-[0.24em] text-[#8ea5bd]">
            / {String(plan?.duration || "plan").toLowerCase()}
          </p>
        </div>

        <p className={`mt-5 leading-7 text-[#c0cddd] ${compact ? "line-clamp-3 text-sm" : "text-[15px]"}`}>
          {plan?.description || "Tailored pricing for focused product delivery and long-term support."}
        </p>

        <div className="mt-6 flex-1 rounded-[1.4rem] border border-[#213147] bg-[rgba(8,14,24,0.44)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.28em] text-[#8fdcff]">What&apos;s Included</p>
            <p className="text-xs text-[#91a6be]">{featureCount} items</p>
          </div>
          <div className="space-y-3">
            {(plan?.features || []).slice(0, compact ? 4 : 6).map((feature) => (
              <div key={feature} className="flex items-start gap-3 text-sm text-[#dfe8f2]">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#33506f] bg-[#10233a] text-[#8fdcff]">
                  <BadgeCheck size={12} />
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <OpenChatButton className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 sm:w-auto">
            Let&apos;s Talk
            <ArrowRight size={16} />
          </OpenChatButton>
          <Link
            href={plan?.slug ? `/pricing/${plan.slug}` : "/pricing"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#35506f] px-5 py-3 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff] sm:w-auto"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
