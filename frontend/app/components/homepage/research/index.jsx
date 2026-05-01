import Link from "next/link";
import ResearchCard from "@/app/components/research/research-card";
import SectionHeading from "../section-heading";

export default function ResearchSection({ publications = [] }) {
  const latestPublications = Array.isArray(publications) ? publications.slice(0, 6) : [];

  return (
    <section id="research" className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top_left,rgba(115,212,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(113,241,184,0.1),transparent_26%),linear-gradient(180deg,#10192b,#09111d)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-5 md:p-8">
        <SectionHeading
          label="Research"
          title="Latest research publications, papers, and scholarly work"
          description="A fresh research shelf that keeps the newest publications first with direct paths to detail pages and original publication links."
        />

        {latestPublications.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#2d415d] bg-[linear-gradient(180deg,rgba(13,23,40,0.94),rgba(9,17,29,0.94))] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">No research publications yet</p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#b8c7d8]">
              Publish research items from the admin panel and the newest entries will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
            {latestPublications.map((publication) => (
              <ResearchCard key={publication.id} publication={publication} compact />
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center lg:mt-12">
          <Link
            href="/research"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#07111d] transition-all duration-200 ease-out hover:opacity-95 sm:w-auto md:px-8 md:py-4 md:text-sm"
          >
            <span>View All Research</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
