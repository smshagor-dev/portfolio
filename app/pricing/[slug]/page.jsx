import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import { getPricingDetailData } from "@/lib/api";

export const dynamic = "force-dynamic";

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

function stripHtml(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function PricingDetailPage({ params }) {
  const resolvedParams = await params;
  const data = await getPricingDetailData(resolvedParams.slug).catch(() => null);

  if (!data?.pricing) {
    notFound();
  }

  const { pricing, relatedPricings = [] } = data;

  return (
    <div className="py-8 text-white">
      <section className="overflow-hidden rounded-[2rem] border border-[#22324a] bg-[radial-gradient(circle_at_top,rgba(255,214,102,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(112,213,255,0.16),transparent_30%),linear-gradient(180deg,#10192c,#09111d)] shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="p-6 md:p-8 xl:p-10">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm text-[#79d4ff] transition hover:text-white"
            >
              <span>{"<"}</span>
              Back to pricing
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#2d5074] bg-[#11253a] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                <BadgeCheck size={14} />
                <span>{pricing.duration}</span>
              </span>
              {pricing.isPopular ? (
                <span className="rounded-full border border-[#6a6230] bg-[#2b2611] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#ffe08a]">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles size={12} />
                    Most Popular
                  </span>
                </span>
              ) : null}
              <span className="rounded-full border border-[#344760] bg-[#111d31] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b5c5d6]">
                Pricing detail page
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              {pricing.name}
            </h1>
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <p className="text-4xl font-semibold tracking-tight text-[#9ae2ff] md:text-5xl">
                {formatPrice(pricing.price)}
              </p>
              <p className="pb-2 text-sm uppercase tracking-[0.24em] text-[#8ea5bd]">
                / {String(pricing.duration || "plan").toLowerCase()}
              </p>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-[#bcc8d8] md:text-base">
              {pricing.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4 border-t border-[#1d2d42] pt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-6 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
              >
                Let&apos;s Talk
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-full border border-[#3a5678] px-6 py-3 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
              >
                View All Plans
              </Link>
            </div>

            <div className="mt-8 border-t border-[#203049] pt-8">
              <p className="text-xs uppercase tracking-[0.32em] text-[#70d5ff]">Plan Details</p>
              <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                Long-form pricing content with real scope clarity
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-[#9fb1c7] md:text-base">
                This page gives the plan the same detailed presentation style people expect from polished service and article pages.
              </p>
            </div>

            <div
              className="service-content mt-8 border-t border-[#203049] pt-8"
              dangerouslySetInnerHTML={{ __html: pricing.content }}
            />
          </div>

          <aside className="border-t border-[#1d2d42] bg-[linear-gradient(180deg,rgba(10,18,31,0.82),rgba(8,13,23,0.96))] p-6 xl:border-l xl:border-t-0 xl:p-8">
            <div className="rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Plan Includes</p>
              <div className="mt-4 space-y-3">
                {(pricing.features || []).map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 rounded-[1.1rem] border border-[#24344d] bg-[#0d1728] p-4"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#33506f] bg-[#10233a] text-[#8fdcff]">
                      <BadgeCheck size={12} />
                    </span>
                    <span className="text-sm leading-6 text-[#dfe8f2]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">More Pricing</p>
              <div className="mt-4 space-y-3">
                {relatedPricings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2a3b55] bg-[#0e1829] p-4 text-sm text-[#9fb1c7]">
                    No related pricing plans available.
                  </div>
                ) : (
                  relatedPricings.map((item) => (
                    <Link
                      key={item.id}
                      href={`/pricing/${item.slug}`}
                      className="block rounded-[1.25rem] border border-[#24344d] bg-[#0d1728] p-4 transition hover:border-[#3a5678]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{item.name}</p>
                        <span className="text-xs text-[#8fa4bb]">{item.duration}</span>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#8fa4bb]">
                        {formatPrice(item.price)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#9fb1c7]">
                        {stripHtml(item.description).slice(0, 110)}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
