"use client";

import dynamic from "next/dynamic";
import StatsCounterSection from "./stats-counter";

const HeroSection = dynamic(() => import("./hero-section"), {
  ssr: false,
});

const ServicesSection = dynamic(() => import("./services"), {
  ssr: false,
});

const HowIWorkSection = dynamic(() => import("./how-i-work"), {
  ssr: false,
});

const PricingSection = dynamic(() => import("./pricing"), {
  ssr: false,
});

const Projects = dynamic(() => import("./projects"), {
  ssr: false,
});

export default function HomeClientSections({
  profile,
  statsCounters,
  serviceSection,
  services,
  pricings,
  projects,
}) {
  return (
    <>
      <HeroSection profile={profile} />
      <StatsCounterSection counters={statsCounters} />
      <ServicesSection serviceSection={serviceSection} services={services} />
      <HowIWorkSection />
      <PricingSection pricings={pricings} />
      <Projects projects={projects} />
    </>
  );
}
