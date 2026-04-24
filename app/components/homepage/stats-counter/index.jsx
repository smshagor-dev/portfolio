import { getStatsIconOption } from "@/utils/stats-icons";

function StatsCounterSection({ counters = [] }) {
  const statsItems = Array.isArray(counters) ? counters.filter(Boolean) : [];

  if (!statsItems.length) {
    return null;
  }

  return (
    <section id="stats" className="relative mt-8 lg:mt-10">
      <div className="rounded-[1.8rem] border border-[#2b3046] bg-[linear-gradient(180deg,rgba(18,22,36,0.96),rgba(12,16,30,0.96))] p-3 shadow-[0_24px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-6 lg:p-8">
        <div className="mb-5 h-px bg-gradient-to-r from-transparent via-pink-500 to-violet-500" />
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statsItems.map((item, index) => {
            const Icon = getStatsIconOption(item?.icon)?.icon;

            return (
              <div
                className="rounded-2xl border border-[#273056] bg-[linear-gradient(180deg,rgba(20,24,42,0.94),rgba(12,16,31,0.94))] p-4 transition hover:border-[#7a61ff] sm:p-5"
                key={`${item?.label || "counter"}-${index}`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="inline-flex rounded-full border border-[#39457b] bg-[#131a33] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f0d7a1] sm:tracking-[0.28em]">
                    {item?.highlight || "Highlight"}
                  </span>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#ec4899)] text-white shadow-[0_12px_22px_rgba(124,58,237,0.28)]">
                    <Icon size={18} />
                  </span>
                </div>
                <p className="break-words text-3xl font-semibold text-white sm:text-4xl">{item?.count}</p>
                <p className="mt-2 text-sm leading-6 text-[#c9cfde]">{item?.label}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-5 h-px bg-gradient-to-r from-transparent via-violet-500 to-pink-500" />
      </div>
    </section>
  );
}

export default StatsCounterSection;
