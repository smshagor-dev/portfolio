import ArticleCatalog from "./article-catalog";
import { getArticles, getSiteSettings } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSiteSettings().catch(() => null);
  return buildPageMetadata(settings, {
    title: "Articles",
    description: "Read articles, technical notes, and recent writing.",
    path: "/artical",
  });
}

export default async function ArticalPage() {
  const articles = await getArticles().catch(() => []);

  const categories = Array.from(
    new Map(
      (Array.isArray(articles) ? articles : [])
        .flatMap((article) => (Array.isArray(article?.categories) ? article.categories : []))
        .map((category) => [category.slug, category]),
    ).values(),
  );

  return (
    <div className="py-8 text-white">
      <section className="overflow-hidden rounded-[2rem] border border-[#22324a] bg-[radial-gradient(circle_at_top_left,rgba(112,213,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(124,240,183,0.12),transparent_28%),linear-gradient(180deg,#10192c,#09111d)] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.24)] lg:p-12">
        <div className="mx-auto max-w-4xl text-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#35506f] bg-[linear-gradient(180deg,rgba(18,37,58,0.92),rgba(11,22,37,0.92))] px-5 py-2 shadow-[0_14px_32px_rgba(0,0,0,0.2)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#79d4ff] shadow-[0_0_18px_rgba(121,212,255,0.9)]" />
              <p className="text-sm uppercase tracking-[0.35em] text-[#bde9ff]">Editorial Library</p>
            </div>
            <h1 className="mt-6 bg-[linear-gradient(135deg,#f4fbff_0%,#9edfff_45%,#7cf0b7_100%)] bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-5xl lg:text-6xl">
              Articles
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#d3d8e8] lg:text-lg">
              Explore the article library with category-based filtering, cleaner reading previews, and dedicated detail pages for every published post.
            </p>
          </div>
        </div>
      </section>

      <ArticleCatalog articles={articles} categories={categories} />
    </div>
  );
}
