import BlogCard from "../components/homepage/blog/blog-card";
import { getBlogs, getSiteSettings } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSiteSettings().catch(() => null);
  return buildPageMetadata(settings, {
    title: "Blog",
    description: "Browse all blog posts and articles from the website.",
    path: "/blog",
  });
}

async function page() {
  const [blogs, settings] = await Promise.all([
    getBlogs().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  return (
    <div className="py-8">
      <div className="flex justify-center my-5 lg:py-8">
        <div className="flex  items-center">
          <span className="w-24 h-[2px] bg-[#1a1443]"></span>
          <span className="bg-[#1a1443] w-fit text-white p-2 px-5 text-2xl rounded-md">
            {settings?.websiteTitle ? `${settings.websiteTitle} Blog` : "All Blog"}
          </span>
          <span className="w-24 h-[2px] bg-[#1a1443]"></span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 lg:gap-8 xl:gap-10">
        {
          blogs.map((blog, i) => (
            blog?.cover_image &&
            <BlogCard blog={blog} key={i} />
          ))
        }
      </div>
    </div>
  );
};

export default page;
