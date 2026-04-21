import { getStatsIconOption } from "@/utils/stats-icons";
import SectionHeading from "../section-heading";

export default function AchievementSection({ counters = [] }) {
  const items = Array.isArray(counters) ? counters.filter(Boolean) : [];

  if (!items.length) {
    return null;
  }

  return (
    <section id="achievement" className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(255,202,102,0.12),transparent_30%),linear-gradient(180deg,#10192b,#09111d)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-8">
        <SectionHeading
          label="Achivement"
          title="Measured progress, delivery wins, and proof built across real work"
          description="A focused snapshot of the numbers behind shipped products, client trust, long-term consistency, and ongoing growth."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => {
            const Icon = getStatsIconOption(item?.icon)?.icon;

            return (
              <article
                key={`${item?.label || "achievement"}-${index}`}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#2b3f58] bg-[linear-gradient(180deg,rgba(17,27,44,0.98),rgba(9,15,26,0.98))] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#6bcff9]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,210,117,0.95),rgba(108,207,249,0.85),transparent)]" />
                <div className="absolute -right-8 top-4 h-20 w-20 rounded-full bg-[#ffc96f]/10 blur-3xl transition duration-300 group-hover:bg-[#ffc96f]/20" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full border border-[#445b76] bg-[#121c2e] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[#f4d08a]">
                      {item?.highlight || "Highlight"}
                    </span>
                    <p className="mt-5 text-4xl font-semibold text-white">{item?.count}</p>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#35506f] bg-[linear-gradient(135deg,#17304c,#102038)] text-[#8cddff] shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
                    <Icon size={20} />
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#c5d3e2]">{item?.label}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
