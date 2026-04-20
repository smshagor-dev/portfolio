import BlogCard from "../components/homepage/blog/blog-card";
import { getBlogs } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ArticalPage() {
  const blogs = await getBlogs();

  return (
    <div className="py-8 text-white">
      <section className="rounded-3xl border border-[#25213b] bg-[linear-gradient(135deg,#1a1443,#0d1224)] p-8 lg:p-12">
        <p className="text-sm uppercase tracking-[0.35em] text-[#16f2b3]">Artical</p>
        <h1 className="mt-4 text-4xl font-bold lg:text-5xl">
          Thoughts, notes, and technical writing from recent work.
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[#d3d8e8] lg:text-lg">
          A reading list of development articles, lessons, and engineering notes.
        </p>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:gap-8 xl:gap-10">
        {blogs.map((blog, index) =>
          blog?.cover_image ? <BlogCard blog={blog} key={index} /> : null,
        )}
      </div>
    </div>
  );
}
