import AchievementSection from "./components/homepage/achievement";
import Blog from "./components/homepage/blog";
import ContactSection from "./components/homepage/contact";
import Education from "./components/homepage/education";
import Experience from "./components/homepage/experience";
import HeroSection from "./components/homepage/hero-section";
import HowIWorkSection from "./components/homepage/how-i-work";
import PricingSection from "./components/homepage/pricing";
import Projects from "./components/homepage/projects";
import ServicesSection from "./components/homepage/services";
import Skills from "./components/homepage/skills";
import StatsCounterSection from "./components/homepage/stats-counter";
import TestimonialsSection from "./components/homepage/testimonials";
import { getHomePageData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { profile, serviceSection, services, statsCounters, experiences, skills, projects, educations, blogs, pricings } =
    await getHomePageData();

  return (
    <div suppressHydrationWarning >
      <HeroSection profile={profile} />
      <StatsCounterSection counters={statsCounters} />
      <ServicesSection serviceSection={serviceSection} services={services} />
      <HowIWorkSection />
      <PricingSection pricings={pricings} />
      <Projects projects={projects} />
      <Skills skills={skills} />
      <Experience experiences={experiences} />
      <Education educations={educations} />
      <AchievementSection counters={statsCounters} />
      <TestimonialsSection services={services} />
      <Blog blogs={blogs} />
      <ContactSection profile={profile} />
    </div>
  )
};
