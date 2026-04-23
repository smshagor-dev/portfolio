import Image from "next/image";
import SectionHeading from "../section-heading";

export default function AchievementSection({ achievements = [] }) {
  const items = Array.isArray(achievements) ? achievements.filter(Boolean) : [];

  if (!items.length) {
    return null;
  }

  return (
    <section id="achievement" className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(255,202,102,0.12),transparent_30%),linear-gradient(180deg,#10192b,#09111d)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-8">
        <SectionHeading
          label="Achievement"
          title="Awards, certificates, and milestones from real work"
          description="A dedicated collection of recognitions, certifications, and important wins across professional and academic work."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={`${item?.title || "achievement"}-${index}`}
              className="group relative overflow-hidden rounded-[1.75rem] border border-[#2b3f58] bg-[linear-gradient(180deg,rgba(17,27,44,0.98),rgba(9,15,26,0.98))] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#6bcff9]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,210,117,0.95),rgba(108,207,249,0.85),transparent)]" />
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#35506f] bg-[#102038]">
                  {item?.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || "Achievement image"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.25em] text-[#8cddff]">
                      {item?.type || "Award"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="inline-flex rounded-full border border-[#445b76] bg-[#121c2e] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[#f4d08a]">
                    {item?.type || "Achievement"}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{item?.title}</h3>
                  <p className="mt-2 text-sm text-[#9fc1de]">{item?.issuer}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[#7dd9ff]">{item?.date}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
