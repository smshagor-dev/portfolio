const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/sm-shagor/";

export default function LinkedInPostsSection({ posts = [] }) {
  const visiblePosts = (Array.isArray(posts) ? posts : []).filter(
    (post) => post?.status !== false && post?.embedUrl,
  );

  if (visiblePosts.length === 0) {
    return null;
  }

  return (
    <section id="linkedin-updates" className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top_left,rgba(10,102,194,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(112,213,255,0.08),transparent_26%),linear-gradient(180deg,#0d1728,#08111d)] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 px-1 sm:px-2">
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a66c2] text-lg font-bold text-white shadow-[0_10px_30px_rgba(10,102,194,0.32)]">
              in
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[#a9dfff]">
              LinkedIn
            </span>
          </div>
          {visiblePosts.length > 3 ? (
            <span className="hidden text-xs text-[#8095aa] sm:block">Scroll to see more →</span>
          ) : null}
        </div>

        <div className="relative">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 pr-1 [scrollbar-color:#355577_transparent] [scrollbar-width:thin]">
            {visiblePosts.map((post, index) => (
              <article
                key={post.id || post.embedUrl}
                className="flex min-w-[88%] snap-start flex-col overflow-hidden rounded-[1.5rem] border border-[#2a405c] bg-[#0b1524] shadow-[0_18px_48px_rgba(0,0,0,0.26)] sm:min-w-[calc(50%-0.5rem)] xl:min-w-[calc((100%-2rem)/3)] xl:max-w-[calc((100%-2rem)/3)]"
              >
                <div className="flex min-h-[76px] items-center justify-between gap-3 border-b border-[#20334a] bg-[linear-gradient(180deg,#101d30,#0c1727)] px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#70d5ff]">
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
                      className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#355577] bg-[#10243a] px-3 py-2 text-[11px] font-semibold text-[#9edfff] transition hover:border-[#70d5ff] hover:text-white"
                    >
                      View ↗
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

                <div className="mt-auto border-t border-[#20334a] bg-[linear-gradient(180deg,#0f1b2d,#0b1524)] p-3.5">
                  <a
                    href={LINKEDIN_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a66c2] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(10,102,194,0.28)] transition hover:bg-[#0b72d5]"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/15 text-xs font-bold">
                      in
                    </span>
                    Follow on LinkedIn
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
