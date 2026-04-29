"use client";

import Link from "next/link";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import SectionHeading from "../section-heading";

export default function FaqSection({ faqs = [], showAll = false, showPageLink = true }) {
  const items = Array.isArray(faqs) ? faqs.filter((item) => item?.question && item?.answer) : [];
  const initialVisibleCount = 5;
  const [openIndex, setOpenIndex] = useState(0);
  const visibleItems = showAll ? items : items.slice(0, initialVisibleCount);
  const hasHiddenItems = items.length > initialVisibleCount;

  if (!items.length) {
    return null;
  }

  return (
    <section id="faq" className="my-12 lg:my-20">
      <div className="rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top_left,rgba(112,213,255,0.12),transparent_28%),linear-gradient(180deg,#10192b,#09111d)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-5 md:p-8">
        <SectionHeading
          label="FAQ"
          title="Answers to the questions that usually come up before we start"
          description="A quick overview of how I usually work, what I can help with, and what to expect when we move from idea to delivery."
        />

        <div className="mx-auto mt-8 max-w-4xl space-y-4">
          {visibleItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.id || `${item.question}-${index}`}
                className="overflow-hidden rounded-[1.5rem] border border-[#29415d] bg-[linear-gradient(180deg,rgba(16,26,43,0.98),rgba(10,16,28,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.2)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02] sm:px-6 sm:py-5"
                >
                  <span className="text-base font-semibold text-white sm:text-lg">{item.question}</span>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#35506f] bg-[#102038] text-[#8fdcff] transition ${isOpen ? "rotate-180" : ""}`}
                  >
                    <FiChevronDown size={18} />
                  </span>
                </button>

                {isOpen ? (
                  <div className="border-t border-[#203049] px-5 py-5 sm:px-6">
                    <div
                      className="prose prose-invert max-w-none text-sm leading-7 text-[#c8d6e5]"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}

          {hasHiddenItems && showPageLink ? (
            <div className="flex justify-center pt-2">
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-full border border-[#35506f] bg-[#102038] px-5 py-3 text-sm font-semibold text-[#dff4ff] transition hover:border-[#70d5ff] hover:text-white"
              >
                See more
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
