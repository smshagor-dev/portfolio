"use client";

import { useState } from "react";
import Image from "next/image";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { skillsImage } from "@/utils/skill-image";
import SectionHeading from "../section-heading";

function getSkillInitials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function normalizeSkills(skills = []) {
  return skills
    .map((skill, index) => {
      const name = skill?.name?.trim?.() || "";
      const image = skill?.image?.trim?.() || "";
      const percentage = Math.max(0, Math.min(100, Number(skill?.percentage) || 0));

      if (!name) {
        return null;
      }

      return {
        id: skill?.id || `${name}-${index}`,
        name,
        image: image || skillsImage(name)?.src || "",
        percentage,
      };
    })
    .filter(Boolean);
}

function Skills({ skills = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const items = normalizeSkills(skills);
  const previewCount = 8;
  const hasMoreItems = items.length > previewCount;

  if (!items.length) {
    return null;
  }

  return (
    <section id="skills" className="relative z-50 my-12 lg:my-24">
      <Image
        src="/section.svg"
        alt="Skills section background"
        width={1572}
        height={795}
        className="absolute top-0 -z-10 opacity-70"
      />

      <div className="overflow-hidden rounded-[2rem] border border-[#25213b] bg-[radial-gradient(circle_at_top,rgba(122,97,255,0.14),transparent_28%),linear-gradient(180deg,rgba(16,23,45,0.96),rgba(9,14,28,0.98))] px-4 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.25)] sm:px-5 md:px-8">
        <div className="py-8">
          <SectionHeading
            label="Skills"
            title="Core tools and technologies I use to design, ship, and keep products moving"
            description="A practical snapshot of the stack I reach for most often, along with the level of confidence built through repeated delivery."
            className="mb-8"
          />

          <div id="skills-grid" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {items.map((skill, index) => (
              <article
                key={skill.id}
                className={`rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)] sm:p-5 ${
                  !isExpanded && index >= previewCount ? "hidden" : ""
                }`}
                aria-hidden={!isExpanded && index >= previewCount}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] border border-[#314768] bg-[#0d1728] p-3 sm:h-16 sm:w-16">
                    {skill.image && !failedImages[skill.id] ? (
                      <img
                        src={skill.image}
                        alt={skill.name}
                        width="44"
                        height="44"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 object-contain sm:h-11 sm:w-11"
                        onError={() => setFailedImages((current) => ({ ...current, [skill.id]: true }))}
                      />
                    ) : (
                      <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8fe6c1]">
                        {getSkillInitials(skill.name) || "SK"}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate text-base font-semibold text-white sm:text-lg">{skill.name}</h3>
                      <span className="text-sm font-medium text-[#7dd3fc]">{skill.percentage}%</span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#16233a]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] via-[#7c3aed] to-[#f472b6]"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {hasMoreItems ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setIsExpanded((current) => !current)}
                className="inline-flex items-center gap-3 rounded-full border border-[#314768] bg-[#0d1728] px-5 py-3 text-sm font-medium text-[#d7dfec] transition hover:border-[#4c6d98] hover:bg-[#12203a]"
                aria-expanded={isExpanded}
                aria-controls="skills-grid"
              >
                <span>{isExpanded ? "Show less" : "Show more"}</span>
                {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default Skills;
