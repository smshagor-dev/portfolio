"use client";

import { motion } from "framer-motion";

export default function WorkflowCard({
  step,
  description,
  icon: Icon,
  index,
  isActive,
  isDimmed,
  isMobile,
  className = "",
  onHoverStart,
  onHoverEnd,
}) {
  const hoverAnimation = isMobile
    ? {
        scale: 1.01,
      }
    : {
        scale: 1.035,
        rotateX: -10,
        rotateY: index % 2 === 0 ? 10 : -10,
      };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      whileHover={hoverAnimation}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      style={{ transformStyle: isMobile ? "flat" : "preserve-3d" }}
      className={`group relative flex h-full min-h-[220px] w-full flex-col overflow-hidden rounded-[1.75rem] border p-5 transition-all duration-300 md:min-h-[240px] md:p-6 ${
        isActive
          ? "border-[#73dcff] bg-[linear-gradient(180deg,rgba(18,32,54,0.96),rgba(8,14,24,1))]"
          : "border-[#28405f] bg-[linear-gradient(180deg,rgba(14,24,42,0.9),rgba(7,12,22,0.98))]"
      } ${
        isDimmed ? "opacity-45 saturate-75" : "opacity-100"
      } ${className} shadow-[0_16px_30px_rgba(0,0,0,0.18),0_30px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl`}
    >
      <motion.div
        aria-hidden="true"
        animate={
          isActive
            ? { backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }
            : { backgroundPosition: ["0% 0%", "60% 40%", "0% 0%"] }
        }
        transition={{ duration: isActive ? 4 : 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(115,220,255,0.2), transparent 30%), radial-gradient(circle at bottom right, rgba(90,255,193,0.14), transparent 28%), radial-gradient(circle at center, rgba(255,214,102,0.08), transparent 42%)",
          backgroundSize: "140% 140%",
        }}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-6 bottom-3 h-10 rounded-full blur-2xl transition-all duration-300 ${
          isActive ? "bg-[#66d9ff]/30 opacity-100" : "bg-[#0f223a] opacity-60"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-10 top-4 h-16 rounded-full blur-3xl transition-all duration-300 ${
          isActive ? "bg-[#8cffc7]/16 opacity-100" : "bg-transparent opacity-0"
        }`}
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: 0 }}
        transition={{ duration: 0 }}
        style={{ transform: isMobile ? "none" : "translateZ(36px)" }}
        className="relative"
      >
        <div
          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${
            isActive ? "border-[#73dcff] bg-[#122b45]" : "border-[#2f4867] bg-[#102238]"
          } text-[#8fe0ff] shadow-[0_10px_25px_rgba(0,0,0,0.22),0_0_0_1px_rgba(255,255,255,0.03)]`}
        >
          <Icon size={24} strokeWidth={1.9} />
        </div>
      </motion.div>

      <div className="relative mt-6 flex flex-1 flex-col" style={{ transform: isMobile ? "none" : "translateZ(24px)" }}>
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-white">{step}</h3>
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isActive ? "bg-[#8effd1] shadow-[0_0_14px_rgba(142,255,209,0.85)]" : "bg-[#35516f]"
            }`}
          />
        </div>
        <p className="mt-3 flex-1 max-w-[18rem] text-sm leading-7 text-[#b7c7d8]">{description}</p>
      </div>
    </motion.article>
  );
}
