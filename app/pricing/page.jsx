import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import PricingCard from "../components/homepage/pricing/pricing-card";
import { getPricingPageData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const { profile, pricings = [] } = await getPricingPageData();
  const highlightedPlan = pricings.find((plan) => plan.isPopular) || pricings[0] || null;

  return (
    <div className="py-8 text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top_right,rgba(255,214,102,0.16),transparent_18%),radial-gradient(circle_at_left,rgba(112,213,255,0.14),transparent_28%),linear-gradient(180deg,#101828,#09111d)] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.28)] lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(122,218,181,0.12),transparent_18%),radial-gradient(circle_at_15%_85%,rgba(117,160,255,0.12),transparent_18%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#70d5ff]">Pricing</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-[#f5f8fd] lg:text-5xl">
              Flexible pricing for product teams, founder-led launches, and serious digital builds
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#d3dceb] lg:text-lg">
              Every plan is designed to feel clear before we talk, then adjustable once we define the exact pages, features, backend work, and support level you need.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-6 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
              >
                Let&apos;s Talk
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center rounded-full border border-[#3a5678] px-6 py-3 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
              >
                Jump To Contact
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.8rem] border border-[#314762] bg-[rgba(9,17,29,0.72)] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-[#8fdcff]">
              <Sparkles size={18} />
              <p className="text-xs uppercase tracking-[0.28em]">Best Starting Point</p>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              {highlightedPlan?.name || "Tailored plan selection"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#c7d3e1]">
              {highlightedPlan?.description ||
                "We can shape the right package around your timeline, feature set, and delivery goals."}
            </p>
            <div className="mt-5 space-y-3">
              {(highlightedPlan?.features || []).slice(0, 4).map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-[#dfe8f2]">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#8fdcff]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#97a9be]">
              Contact: {profile?.email || "Available on request"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        {pricings.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-[#2a3b55] bg-[#0e1829] p-8 text-center text-sm text-[#9fb1c7]">
            No pricing plans are published yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {pricings.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
