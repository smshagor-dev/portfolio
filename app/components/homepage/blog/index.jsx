import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import BlogCard from "./blog-card";
import SectionHeading from "../section-heading";

export default function Blog({ articles = [] }) {
  const featuredArticles = Array.isArray(articles) ? articles.slice(0, 3) : [];

  return (
    <section id="blogs" className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top_left,rgba(115,212,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(113,241,184,0.1),transparent_26%),linear-gradient(180deg,#10192b,#09111d)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-8">
        <SectionHeading
          label="Artical"
          title="Selected writing from product builds, implementation lessons, and engineering decisions"
          description="A more editorial article shelf for the homepage, built around published entries from your admin panel instead of an external feed."
        />

        {featuredArticles.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#2d415d] bg-[linear-gradient(180deg,rgba(13,23,40,0.94),rgba(9,17,29,0.94))] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">No published articles yet</p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#b8c7d8]">
              Publish articles from the admin panel and this section will automatically surface the latest writing here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr_1fr]">
            {featuredArticles.map((article) => (
              <BlogCard article={article} key={article.id} />
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center lg:mt-12">
          <Link
            className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#07111d] no-underline transition-all duration-200 ease-out hover:gap-3 hover:opacity-95 hover:text-[#07111d] hover:no-underline md:px-8 md:py-4 md:text-sm"
            role="button"
            href="/artical"
          >
            <span>View All Articles</span>
            <FaArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
