import Image from "next/image";

const PROMO_URL = "https://openmindai.org";
const CTA_LABEL = "Explore my Open Mind AI";

export default function OpenMindAIPromo() {
  return (
    <>
      <section className="my-12 lg:my-20" aria-label="OpenMindAI promotion">
        <div className="overflow-hidden rounded-[2rem] border border-[#2b455f] bg-[linear-gradient(180deg,#0d1828,#08111d)] shadow-[0_26px_80px_rgba(0,0,0,0.28)]">
          <a
            href={PROMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
            aria-label="Visit OpenMindAI website"
          >
            <div className="relative overflow-hidden">
              <Image
                src="/openmindai-promo.svg"
                alt="OpenMindAI local, private and offline-first AI for desktop and mobile"
                width={1600}
                height={560}
                sizes="100vw"
                className="h-auto w-full transition duration-500 group-hover:scale-[1.01]"
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-4 border-t border-[#20354c] bg-[#0b1624] px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">OpenMindAI — local AI built around privacy and offline use.</p>
                <p className="mt-1 text-xs leading-6 text-[#8ea7be]">Explore desktop and mobile experiences, local models, chat, coding and document workflows.</p>
              </div>
              <span className="inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-center text-sm font-semibold text-[#06101b] transition group-hover:opacity-90 sm:w-auto sm:px-6">
                <span>{CTA_LABEL}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current" strokeWidth="1.9" aria-hidden="true">
                  <path d="M7 17 17 7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </section>

    </>
  );
}

