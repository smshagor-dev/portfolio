import Link from "next/link";
import ServicesCarousel from "./services-carousel";
import SectionHeading from "../section-heading";

export default function ServicesSection({ serviceSection, services = [] }) {
  return (
    <section className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(112,213,255,0.16),transparent_34%),linear-gradient(180deg,#0f192b,#09111d)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-8">
        <SectionHeading
          label="Services"
          title={serviceSection?.title || "Professional services built for serious results"}
          description={
            serviceSection?.subtitle ||
            "Explore high-impact service packages with clear outcomes, strong presentation, and detail pages that help clients understand the value fast."
          }
        />

        <div className="mt-8">
          <ServicesCarousel services={services} />
        </div>

        {services.length > 0 ? (
          <div className="mt-8 flex justify-center">
            <Link
              href="/service"
              className="inline-flex items-center rounded-full border border-[#3a5678] px-5 py-3 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
            >
              View All Services
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
