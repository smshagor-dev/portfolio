import TestimonialsSection from "../components/homepage/testimonials";
import { getHomePageData } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const data = await getHomePageData().catch(() => null);
  return buildPageMetadata(data?.siteSettings, {
    title: "Reviews",
    description: "Read all published client reviews and share your experience.",
    path: "/reviews",
  });
}

export default async function ReviewsPage() {
  const { testimonials = [] } = await getHomePageData();

  return (
    <div className="py-8 text-white">
      <TestimonialsSection testimonials={testimonials} showAllReviews ctaPosition="top" />
    </div>
  );
}
