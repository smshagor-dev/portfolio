import AboutSection from "./components/homepage/about";
import Blog from "./components/homepage/blog";
import ContactSection from "./components/homepage/contact";
import Education from "./components/homepage/education";
import Experience from "./components/homepage/experience";
import HeroSection from "./components/homepage/hero-section";
import Projects from "./components/homepage/projects";
import Skills from "./components/homepage/skills";
import StatsCounterSection from "./components/homepage/stats-counter";
import { getHomePageData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { profile, statsCounters, experiences, skills, projects, educations, blogs } =
    await getHomePageData();

  return (
    <div suppressHydrationWarning >
      <HeroSection profile={profile} />
      <StatsCounterSection counters={statsCounters} />
      <AboutSection profile={profile} />
      <Experience experiences={experiences} />
      <Skills skills={skills} />
      <Projects projects={projects} />
      <Education educations={educations} />
      <Blog blogs={blogs} />
      <ContactSection profile={profile} />
    </div>
  )
};
