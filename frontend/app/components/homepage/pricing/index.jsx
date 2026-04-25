import Link from "next/link";
import OpenChatButton from "@/app/components/open-chat-button";
import PricingCarousel from "./pricing-carousel";
import SectionHeading from "../section-heading";

export default function PricingSection({ pricings = [] }) {
  return (
    <section id="pricing" className="my-12 lg:my-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(255,214,102,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(112,213,255,0.14),transparent_30%),linear-gradient(180deg,#101828,#09111d)] p-4 shadow-[0_26px_80px_rgba(0,0,0,0.28)] sm:p-5 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(122,218,181,0.12),transparent_18%),radial-gradient(circle_at_15%_85%,rgba(117,160,255,0.12),transparent_18%)]" />

        <SectionHeading
          label="Pricing"
          title="Clear plans for fast launches, bigger builds, and long-term product support"
          description="Pick a strong starting point, compare deliverables quickly, and move to contact when you're ready to discuss scope."
          className="relative"
        />

        <div className="relative mt-6 sm:mt-8">
          <PricingCarousel pricings={pricings.slice(0, 6)} />
        </div>

        <div className="relative mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            href="/pricing"
            className="inline-flex w-full items-center justify-center rounded-full border border-[#3a5678] px-5 py-3 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff] sm:w-auto"
          >
            View All Pricing
          </Link>
          <OpenChatButton className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 sm:w-auto">
            Let&apos;s Talk
          </OpenChatButton>
        </div>
      </div>
    </section>
  );
}
