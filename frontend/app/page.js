import AchievementSection from "./components/homepage/achievement";
import Blog from "./components/homepage/blog";
import ContactSection from "./components/homepage/contact";
import Education from "./components/homepage/education";
import Experience from "./components/homepage/experience";
import HomeClientSections from "./components/homepage/home-client-sections";
import Skills from "./components/homepage/skills";
import TestimonialsSection from "./components/homepage/testimonials";
import { getHomePageData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { profile, siteSettings, serviceSection, services, statsCounters, achievements, experiences, skills, projects, educations, articles, pricings, testimonials, emergencyContacts } =
    await getHomePageData();

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
      <Skills skills={skills} />
      <Experience experiences={experiences} />
      <Education educations={educations} />
      <AchievementSection achievements={achievements} />
      <TestimonialsSection testimonials={testimonials} showViewAllButton />
      <Blog articles={articles} />
      <ContactSection profile={profile} settings={siteSettings} emergencyContacts={emergencyContacts} />
    </div>
  )
};
