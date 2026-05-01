import AchievementSection from "./components/homepage/achievement";
import AdCodeSlot from "./components/ad-code-slot";
import Blog from "./components/homepage/blog";
import ContactSection from "./components/homepage/contact";
import Education from "./components/homepage/education";
import Experience from "./components/homepage/experience";
import FaqSection from "./components/homepage/faq";
import HomeClientSections from "./components/homepage/home-client-sections";
import ResearchSection from "./components/homepage/research";
import Skills from "./components/homepage/skills";
import TestimonialsSection from "./components/homepage/testimonials";
import { getFeaturedResearchPublications, getHomePageData, getResearchPublications } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ profile, siteSettings, serviceSection, services, statsCounters, achievements, experiences, skills, projects, educations, articles, pricings, faqs, testimonials, emergencyContacts }, researchResponse, latestResearchResponse] =
    await Promise.all([
      getHomePageData(),
      getFeaturedResearchPublications().catch(() => ({ data: [] })),
      getResearchPublications({ status: "published", limit: 3 }).catch(() => ({ data: [] })),
    ]);
  const betweenSectionsAdCode = siteSettings?.adsenseBetweenSectionsCode;
  const featuredResearchPublications = Array.isArray(researchResponse?.data) ? researchResponse.data : [];
  const latestResearchPublications = Array.isArray(latestResearchResponse?.data) ? latestResearchResponse.data : [];
  const homepageResearchPublications =
    featuredResearchPublications.length > 0 ? featuredResearchPublications : latestResearchPublications;

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
      <ResearchSection publications={homepageResearchPublications} />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <ContactSection profile={profile} settings={siteSettings} emergencyContacts={emergencyContacts} />
      <AdCodeSlot code={betweenSectionsAdCode} className="mt-8" />
      <FaqSection faqs={faqs} />
    </div>
  )
};
