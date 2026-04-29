import Link from "next/link";
import { ArrowRight } from "lucide-react";
import OpenChatButton from "../components/open-chat-button";
import FaqSection from "../components/homepage/faq";
import SectionHeading from "../components/homepage/section-heading";
import { getHomePageData } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const data = await getHomePageData().catch(() => null);
  return buildPageMetadata(data?.siteSettings, {
    title: "FAQ",
    description: "Read the full list of frequently asked questions about process, delivery, pricing, and support.",
    path: "/faq",
  });
}

export default async function FaqPage() {
  const { faqs = [] } = await getHomePageData();

  return (
    <div className="py-8 text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top_right,rgba(112,213,255,0.16),transparent_18%),radial-gradient(circle_at_left,rgba(122,218,181,0.14),transparent_28%),linear-gradient(180deg,#101828,#09111d)] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.28)] lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(122,218,181,0.12),transparent_18%),radial-gradient(circle_at_15%_85%,rgba(117,160,255,0.12),transparent_18%)]" />

        <div className="relative mx-auto max-w-5xl">
          <SectionHeading
            label="FAQ"
            title="Detailed answers for the questions that usually come up before we start"
            description="This page keeps the full FAQ list in one place, so the homepage stays cleaner while visitors can still browse every answer when they want more detail."
          />

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <OpenChatButton
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-6 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 sm:w-auto"
            >
              Ask a Question
              <ArrowRight size={16} />
            </OpenChatButton>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-full border border-[#3a5678] px-6 py-3 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff] sm:w-auto"
            >
              Back To Home
            </Link>
          </div>
        </div>
      </section>

      <FaqSection faqs={faqs} showAll showPageLink={false} />
    </div>
  );
}
