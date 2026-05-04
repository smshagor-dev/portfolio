import StatsCounterSection from "./stats-counter";
import HeroSection from "./hero-section";
import ServicesSection from "./services";
import HowIWorkSection from "./how-i-work";
import PricingSection from "./pricing";
import Projects from "./projects";

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
