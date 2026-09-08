import SectionHeading from "../section-heading";

export default function LinkedInPostsSection({ posts = [] }) {
  const visiblePosts = (Array.isArray(posts) ? posts : [])
    .filter((post) => post?.status !== false && post?.embedUrl)
    .slice(0, 4);

  if (visiblePosts.length === 0) {
    return null;
  }

  return (
    <section id="linkedin-updates" className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top_left,rgba(73,142,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(112,213,255,0.1),transparent_25%),linear-gradient(180deg,#10192b,#09111d)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-5 md:p-8">
        <SectionHeading
          label="LinkedIn"
          title="Research, engineering, and product updates from LinkedIn"
          description="Selected professional updates covering publications, engineering progress, AI systems, software development, and product work."
        />

        <div
          className={
            visiblePosts.length === 1
              ? "mx-auto mt-8 max-w-[620px]"
              : "mt-8 grid gap-6 xl:grid-cols-2"
          }
        >
          {visiblePosts.map((post, index) => (
            <article
              key={post.id || post.embedUrl}
              className="overflow-hidden rounded-[1.6rem] border border-[#2a405c] bg-[#0b1524] shadow-[0_20px_55px_rgba(0,0,0,0.24)]"
            >
              <div className="flex flex-col gap-3 border-b border-[#20334a] bg-[linear-gradient(180deg,#101d30,#0c1727)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#70d5ff]">
                    LinkedIn Update
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {post.title || `LinkedIn Post ${index + 1}`}
                  </p>
                </div>
                {post.postUrl ? (
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#355577] bg-[#10243a] px-4 py-2 text-xs font-semibold text-[#9edfff] transition hover:border-[#70d5ff] hover:text-white"
                  >
                    View on LinkedIn
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>

              <div className="bg-white">
                <iframe
                  src={post.embedUrl}
                  title={post.title || `LinkedIn post ${index + 1}`}
                  className="h-[560px] w-full border-0 sm:h-[540px]"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
