import dynamic from "next/dynamic";
import AdCodeSlot from "./components/ad-code-slot";
import Blog from "./components/homepage/blog";
import FaqSection from "./components/homepage/faq";
import HomeClientSections from "./components/homepage/home-client-sections";
import ResearchSection from "./components/homepage/research";
import Skills from "./components/homepage/skills";
import { getHomePageData, getResearchPublications } from "@/lib/api";

function SectionSkeleton({ className = "" }) {
  return (
    <section className={`my-12 lg:my-20 ${className}`} aria-hidden="true">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[linear-gradient(180deg,#101828,#09111d)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-5 md:p-8">
        <div className="mx-auto h-5 w-32 rounded-full bg-white/10" />
        <div className="mx-auto mt-5 h-10 w-full max-w-2xl rounded-2xl bg-white/10" />
        <div className="mx-auto mt-4 h-6 w-full max-w-3xl rounded-2xl bg-white/5" />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-56 rounded-[1.5rem] border border-white/5 bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const Experience = dynamic(() => import("./components/homepage/experience"), {
  loading: () => <SectionSkeleton />,
});
const Education = dynamic(() => import("./components/homepage/education"), {
  loading: () => <SectionSkeleton />,
});
const AchievementSection = dynamic(() => import("./components/homepage/achievement"), {
  loading: () => <SectionSkeleton />,
});
const TestimonialsSection = dynamic(() => import("./components/homepage/testimonials"), {
  loading: () => <SectionSkeleton />,
});
const ContactSection = dynamic(() => import("./components/homepage/contact"), {
  loading: () => <SectionSkeleton />,
});

export const revalidate = 300;

export default async function Home() {
  const [homeData, latestResearchResponse] = await Promise.all([
    getHomePageData().catch((error) => {
      console.error("Failed to load homepage data in app/page.js:", error.message);
      return null;
    }),
    getResearchPublications({
      status: "published",
      limit: 6,
    }).catch(() => ({ data: [] })),
  ]);
  const {
    profile = null,
    siteSettings = null,
    serviceSection = null,
    services = [],
    statsCounters = [],
    achievements = [],
    experiences = [],
    skills = [],
    projects = [],
    educations = [],
    articles = [],
    pricings = [],
    faqs = [],
    testimonials = [],
    emergencyContacts = [],
  } = homeData || {};
  const betweenSectionsAdCode = siteSettings?.adsenseBetweenSectionsCode;
  const latestResearchPublications = Array.isArray(latestResearchResponse?.data) ? latestResearchResponse.data : [];

  if (!homeData) {
    return (
      <div className="py-8">
        <SectionSkeleton className="mt-0" />
        <div className="mt-6 rounded-[2rem] border border-dashed border-[#2d415d] bg-[linear-gradient(180deg,rgba(13,23,40,0.94),rgba(9,17,29,0.94))] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-white">The homepage is loading degraded content right now.</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#b8c7d8]">
            API data could not be loaded, so the page is rendering a safe fallback instead of blocking paint.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning >
      <HomeClientSections
        profile={profile}
        statsCounters={statsCounters}
        serviceSection={serviceSection}
        services={services}
        pricings={pricings}
        projects={projects}
      />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <Skills skills={skills} />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <Experience experiences={experiences} />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <Education educations={educations} />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <AchievementSection achievements={achievements} />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <TestimonialsSection testimonials={testimonials} showViewAllButton />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <Blog articles={articles} />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <ResearchSection publications={latestResearchPublications} />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <ContactSection profile={profile} settings={siteSettings} emergencyContacts={emergencyContacts} />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <FaqSection faqs={faqs} />
    </div>
  )
};
