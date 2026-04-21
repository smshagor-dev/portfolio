"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  ClipboardList,
  PencilRuler,
  Code2,
  TestTubeDiagonal,
  Rocket,
  Sparkles,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import WorkflowCard from "./workflow-card";
import SectionHeading from "../section-heading";

const workflowSteps = [
  {
    step: "Idea",
    description: "Understanding problem and goals",
    icon: BrainCircuit,
  },
  {
    step: "Planning",
    description: "Defining structure and features",
    icon: ClipboardList,
  },
  {
    step: "Design",
    description: "UI/UX and system design",
    icon: PencilRuler,
  },
  {
    step: "Development",
    description: "Building frontend and backend",
    icon: Code2,
  },
  {
    step: "Testing",
    description: "Fixing bugs and optimizing",
    icon: TestTubeDiagonal,
  },
  {
    step: "Deployment",
    description: "Launching to production",
    icon: Rocket,
  },
  {
    step: "Maintenance",
    description: "Updates and scaling",
    icon: Sparkles,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function Connector({ active, mobile = false, tablet = false }) {
  const baseClass = mobile
    ? "absolute left-5 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#33506f] to-transparent"
    : tablet
      ? "absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-[#2d4461] via-[#4da6d8] to-[#2d4461]"
      : "absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-[#2d4461] via-[#4da6d8] to-[#2d4461]";

  const beamClass = mobile
    ? "absolute left-5 top-0 h-16 w-2 -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-[#86e1ff] to-transparent blur-[2px]"
    : "absolute left-0 top-1/2 h-2 w-20 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#86e1ff] to-transparent blur-[2px]";

  const dotClass = mobile
    ? "absolute left-5 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
    : "absolute left-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full";

  const iconClass = mobile
    ? "relative z-10 ml-[0.45rem] flex h-9 w-9 items-center justify-center rounded-full border"
    : "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border";

  return (
    <div
      className={
        mobile
          ? "pointer-events-none absolute left-0 top-0 h-full w-10 sm:hidden"
          : tablet
            ? "relative hidden h-full min-h-[18rem] w-16 items-center justify-center md:flex lg:hidden"
            : "relative hidden h-full min-h-[18rem] w-16 items-center justify-center lg:flex xl:w-20"
      }
    >
      <div className={baseClass} />
      <motion.div
        aria-hidden="true"
        animate={mobile ? { y: ["0%", "100%"] } : { x: ["0%", "100%"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
        className={beamClass}
      />
      <motion.div
        aria-hidden="true"
        animate={mobile ? { y: [0, 28, 56, 0] } : { x: [0, 18, 36, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className={`${dotClass} ${
          active ? "bg-[#9effd7] shadow-[0_0_18px_rgba(158,255,215,0.95)]" : "bg-[#5c7898] shadow-[0_0_10px_rgba(92,120,152,0.45)]"
        }`}
      />
      <motion.div
        animate={mobile ? { y: [0, 10, 0] } : { x: [0, 12, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className={`${iconClass} ${
          active ? "border-[#73dcff] bg-[#112843] text-[#8fe0ff]" : "border-[#314762] bg-[#0d1728] text-[#6e8aa9]"
        } shadow-[0_10px_20px_rgba(0,0,0,0.18)]`}
      >
        {mobile ? <ArrowDown size={16} /> : <ArrowRight size={16} />}
      </motion.div>
    </div>
  );
}

export default function HowIWorkSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const hasActiveState = activeIndex >= 0;

  useEffect(() => {
    const syncViewport = () => {
      setIsMobile(window.innerWidth < 640);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  return (
    <section className="my-12 lg:my-20">
      <div
        className="relative overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(112,213,255,0.14),transparent_28%),linear-gradient(180deg,#0f192b,#09111d)] px-5 py-8 shadow-[0_18px_38px_rgba(0,0,0,0.18),0_34px_90px_rgba(0,0,0,0.28)] md:px-8 md:py-10"
        style={{ perspective: isMobile ? "none" : "1800px" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(120,161,255,0.12),transparent_18%),radial-gradient(circle_at_85%_10%,rgba(84,240,192,0.12),transparent_18%)]" />

        <SectionHeading
          label="How I Work"
          title="A modern workflow from first idea to long-term product support"
          description="Every project moves through a clear delivery path so design, engineering, launch, and maintenance all stay aligned."
          className="relative"
        />

        <div className="relative mt-10 hidden lg:block">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 px-6">
            <div className="relative h-px bg-gradient-to-r from-transparent via-[#33506f] to-transparent">
              <motion.div
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 h-2 w-24 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-[#74d9ff] to-transparent blur-[2px]"
              />
              <motion.div
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#92ffe1] shadow-[0_0_18px_rgba(146,255,225,0.95)]"
              />
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative flex items-center justify-center gap-0"
          >
            {workflowSteps.map((item, index) => (
              <div key={item.step} className="flex items-center">
                <WorkflowCard
                  {...item}
                  index={index}
                  isMobile={false}
                  className="w-[260px]"
                  isActive={activeIndex === index}
                  isDimmed={hasActiveState && activeIndex !== index}
                  onHoverStart={() => setActiveIndex(index)}
                  onHoverEnd={() => setActiveIndex(0)}
                />
                {index < workflowSteps.length - 1 ? <Connector active={activeIndex >= index} /> : null}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative mt-10 hidden md:block lg:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="hide-scrollbar flex overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-3 pt-2"
          >
            {workflowSteps.map((item, index) => (
              <div key={item.step} className="flex shrink-0 items-stretch">
                <WorkflowCard
                  {...item}
                  index={index}
                  isMobile={false}
                  className="min-w-[260px] w-[260px] snap-center"
                  isActive={activeIndex === index}
                  isDimmed={hasActiveState && activeIndex !== index}
                  onHoverStart={() => setActiveIndex(index)}
                  onHoverEnd={() => setActiveIndex(0)}
                />
                {index < workflowSteps.length - 1 ? <Connector active={activeIndex >= index} tablet /> : null}
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mt-10 flex flex-col gap-5 sm:hidden"
        >
          <div className="pointer-events-none absolute bottom-6 left-5 top-3 w-px bg-gradient-to-b from-[#33506f] via-[#4da6d8] to-transparent" />
          <motion.div
            animate={{ y: ["0%", "100%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute left-5 top-3 h-16 w-2 -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-[#74d9ff] to-transparent blur-[2px]"
          />
          <motion.div
            animate={{ y: [0, 30, 60, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute left-5 top-3 h-3 w-3 -translate-x-1/2 rounded-full bg-[#92ffe1] shadow-[0_0_18px_rgba(146,255,225,0.95)]"
          />

          {workflowSteps.map((item, index) => (
            <div key={item.step} className="relative pl-12">
              <WorkflowCard
                {...item}
                index={index}
                isMobile
                className="w-full"
                isActive={activeIndex === index}
                isDimmed={false}
                onHoverStart={() => setActiveIndex(index)}
                onHoverEnd={() => setActiveIndex(0)}
              />
              {index < workflowSteps.length - 1 ? <Connector active={activeIndex >= index} mobile /> : null}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
