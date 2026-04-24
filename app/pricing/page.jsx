import Link from "next/link";
import { ArrowRight } from "lucide-react";
import OpenChatButton from "../components/open-chat-button";
import PricingCard from "../components/homepage/pricing/pricing-card";
import SectionHeading from "../components/homepage/section-heading";
import { getPricingPageData } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const data = await getPricingPageData().catch(() => null);
  return buildPageMetadata(data?.siteSettings, {
    title: "Pricing",
    description: "Review pricing plans, package structure, and delivery options.",
    path: "/pricing",
  });
}

export default async function PricingPage() {
  const { pricings = [] } = await getPricingPageData();

  return (
    <div className="py-8 text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top_right,rgba(255,214,102,0.16),transparent_18%),radial-gradient(circle_at_left,rgba(112,213,255,0.14),transparent_28%),linear-gradient(180deg,#101828,#09111d)] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.28)] lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(122,218,181,0.12),transparent_18%),radial-gradient(circle_at_15%_85%,rgba(117,160,255,0.12),transparent_18%)]" />

        <div className="relative mx-auto max-w-5xl">
          <SectionHeading
            label="Pricing"
            title="Flexible pricing for product teams, founder-led launches, and serious digital builds"
            description="Every plan is designed to feel clear before we talk, then adjustable once we define the exact pages, features, backend work, and support level you need."
          />

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <OpenChatButton className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-6 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 sm:w-auto">
              Let&apos;s Talk
              <ArrowRight size={16} />
            </OpenChatButton>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-full border border-[#3a5678] px-6 py-3 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff] sm:w-auto"
            >
              Jump To Contact
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(255,214,102,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(112,213,255,0.14),transparent_30%),linear-gradient(180deg,#101828,#09111d)] p-4 shadow-[0_26px_80px_rgba(0,0,0,0.28)] sm:p-5 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(122,218,181,0.12),transparent_18%),radial-gradient(circle_at_15%_85%,rgba(117,160,255,0.12),transparent_18%)]" />

          <SectionHeading
            label="Pricing Plans"
            title="Choose a starting package, then fine-tune the scope around your build"
            description="The pricing grid now follows the same visual direction as the home section so the experience feels more consistent from landing page to detail page."
            className="relative"
          />

          <div className="relative mt-8">
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
          </div>
        </div>
      </section>
    </div>
  );
}
