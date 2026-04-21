"use client";

import { motion } from "framer-motion";

export default function SectionHeading({ label, title, description, className = "" }) {
  return (
    <div className={`relative mx-auto max-w-4xl text-center ${className}`}>
      <div className="flex justify-center">
        <div className="relative inline-flex items-center gap-0">
          <span className="h-[2px] w-16 bg-[linear-gradient(90deg,transparent,#2f5f8b)] md:w-24" />
          <div className="group relative overflow-hidden rounded-xl border border-[#35506f] bg-[linear-gradient(180deg,#14243a,#0d1728)] px-5 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
              <motion.div
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                className="h-full w-24 bg-[linear-gradient(90deg,transparent,rgba(112,213,255,0.95),rgba(255,214,102,0.75),transparent)]"
              />
            </div>
            <div className="pointer-events-none absolute -right-5 top-1 h-8 w-8 rounded-full bg-[#76d6ff]/20 blur-xl" />
            <div className="pointer-events-none absolute -left-4 bottom-0 h-7 w-7 rounded-full bg-[#7cf0b7]/15 blur-lg" />
            <span className="relative text-sm font-medium uppercase tracking-[0.35em] text-white md:text-base">
              {label}
            </span>
          </div>
          <span className="h-[2px] w-16 bg-[linear-gradient(90deg,#2f5f8b,transparent)] md:w-24" />
        </div>
      </div>

      <h2 className="mt-6 text-3xl font-semibold leading-tight text-[#f5f8fd] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#b8c7d8] md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
