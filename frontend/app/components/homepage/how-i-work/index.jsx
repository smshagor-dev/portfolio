"use client";

import Marquee from "react-fast-marquee";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  ClipboardList,
  RotateCw,
  PencilRuler,
  Code2,
  TestTubeDiagonal,
  Rocket,
  Sparkles,
  ArrowRight,
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
    <section id="workflow" className="my-12 lg:my-20">
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mt-10 overflow-x-hidden overflow-y-hidden rounded-[1.7rem] border border-[#27405e] bg-[linear-gradient(180deg,rgba(10,18,31,0.55),rgba(8,13,23,0.72))] px-2 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-3"
        >
          <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(116,217,255,0.9),rgba(142,255,209,0.75),transparent)]" />
          <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(142,255,209,0.75),rgba(116,217,255,0.9),transparent)]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#0f192b] to-transparent sm:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#09111d] to-transparent sm:w-16" />
          <Marquee
            gradient={false}
            speed={isMobile ? 26 : 38}
            pauseOnHover
            pauseOnClick
            direction="left"
            className="overflow-y-hidden py-2"
          >
            {workflowSteps.map((item, index) => (
              <div key={`${item.step}-${index}`} className="mx-2 flex items-center sm:mx-3">
                <WorkflowCard
                  {...item}
                  index={index}
                  isMobile={isMobile}
                  className="h-full w-[180px] sm:w-[210px] md:w-[230px] lg:w-[280px] xl:w-[280px]"
                  isActive={activeIndex === index}
                  isDimmed={hasActiveState && activeIndex !== index}
                  onHoverStart={() => setActiveIndex(index)}
                  onHoverEnd={() => setActiveIndex(0)}
                />
                {index < workflowSteps.length - 1 ? (
                  <motion.div
                    aria-hidden="true"
                    animate={{ x: [0, 10, 0], opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }}
                    className="mx-3 hidden shrink-0 items-center justify-center lg:flex"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-px w-8 bg-gradient-to-r from-transparent via-[#4da6d8] to-transparent" />
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#31567c] bg-[#0d1728] text-[#8fe0ff] shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    aria-hidden="true"
                    animate={{ rotate: [0, 180, 360], opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
                    className="mx-3 hidden shrink-0 items-center justify-center lg:flex"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-px w-8 bg-gradient-to-r from-transparent via-[#f0c36d] to-transparent" />
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#6f5a2d] bg-[#1d1820] text-[#ffd27d] shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
                        <RotateCw size={15} />
                      </span>
                      <span className="h-px w-8 bg-gradient-to-r from-transparent via-[#74d9ff] to-transparent" />
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </Marquee>
        </motion.div>
      </div>
    </section>
  );
}
