// @flow strict
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import BlogCard from './blog-card';
import SectionHeading from '../section-heading';

function Blog({ blogs }) {

  return (
    <section id='blogs' className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(255,140,178,0.12),transparent_30%),linear-gradient(180deg,#10192b,#09111d)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-8">
        <SectionHeading
          label="Artical"
          title="Thoughts, engineering notes, and practical write-ups from real work"
          description="A small reading list of lessons, experiments, and development articles gathered from hands-on building."
        />

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:gap-8 xl:gap-10">
          {
            blogs.slice(0, 6).map((blog, i) => (
              blog?.cover_image &&
              <BlogCard blog={blog} key={i} />
            ))
          }
        </div>

        <div className="mt-5 flex justify-center lg:mt-12">
          <Link
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-white no-underline transition-all duration-200 ease-out hover:gap-3 hover:text-white hover:no-underline md:px-8 md:py-4 md:text-sm md:font-semibold"
            role="button"
            href="/artical"
          >
            <span>View More</span>
            <FaArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
