"use client";

import { buildPublicAssetUrl } from "@/lib/public-backend-url";
import { skillsImage } from "@/utils/skill-image";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Marquee from "react-fast-marquee";
import { MdDownload } from "react-icons/md";
import { RiContactsFill } from "react-icons/ri";
import OpenChatButton from "@/app/components/open-chat-button";

function splitAnimatedLines(value) {
  if (!value) {
    return [];
  }

  const normalized = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (normalized.length > 1) {
    return normalized;
  }

  return value
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function TypeLines({
  lines,
  className = "",
  typingSpeed = 40,
  lineDelay = 280,
  cursorClassName = "text-pink-400",
  lineClassName = "block min-h-[1.2em]",
}) {
  const [visibleText, setVisibleText] = useState(lines.map(() => ""));
  const [activeLine, setActiveLine] = useState(0);
  const isComplete = activeLine >= lines.length;

  useEffect(() => {
    if (!lines.length) {
      return undefined;
    }

    if (isComplete) {
      return undefined;
    }

    const currentLine = lines[activeLine];
    const currentLength = visibleText[activeLine]?.length || 0;

    if (currentLength < currentLine.length) {
      const timeoutId = window.setTimeout(() => {
        setVisibleText((current) =>
          current.map((item, index) =>
            index === activeLine ? currentLine.slice(0, item.length + 1) : item
          )
        );
      }, typingSpeed);

      return () => window.clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(() => {
      setActiveLine((current) => current + 1);
    }, lineDelay);

    return () => window.clearTimeout(timeoutId);
  }, [activeLine, isComplete, lineDelay, lines, typingSpeed, visibleText]);

  return (
    <span className={className}>
      {lines.map((line, index) => {
        const text = visibleText[index] || "";
        const isCurrentLine = index === activeLine && !isComplete;
        const shouldShowLine = text.length > 0;

        if (!shouldShowLine && index !== 0 && index > activeLine) {
          return null;
        }

        return (
          <span className={lineClassName} key={`${line}-${index}`}>
            {text}
            {isCurrentLine && (
              <span className={`ml-0.5 inline-block animate-pulse ${cursorClassName}`}>|</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function HeroSection({ profile }) {
  const heroTitle = profile?.name || "Your Name";
  const heroDescription = profile?.description || "";
  const heroImage = buildPublicAssetUrl(profile?.profile || "/profile.png");
  const resumeUrl = buildPublicAssetUrl(profile?.resume || "#");
  const nameLines = useMemo(
    () => splitAnimatedLines(heroTitle),
    [heroTitle]
  );
  const designationLines = useMemo(
    () => [profile?.designation || "Software Developer"],
    [profile?.designation]
  );
  const heroSkillsValue = profile?.heroSkills;
  const heroSkills = (() => {
    if (Array.isArray(heroSkillsValue)) {
      return {
        title: "",
        items: heroSkillsValue
          .map((skill) => {
            if (typeof skill === "string") {
              const name = skill.trim();
              return name ? { name, image: "" } : null;
            }

            const name = skill?.name?.trim?.() || "";
            const image = skill?.image?.trim?.() || "";
            return name ? { name, image } : null;
          })
          .filter(Boolean),
      };
    }

    if (heroSkillsValue && typeof heroSkillsValue === "object") {
      return {
        title: heroSkillsValue?.title || "",
        items: (heroSkillsValue?.items || [])
          .map((skill) => {
            const name = skill?.name?.trim?.() || "";
            const image = skill?.image?.trim?.() || "";
            return name ? { name, image } : null;
          })
          .filter(Boolean),
      };
    }

    if (typeof heroSkillsValue === "string") {
      return {
        title: "",
        items: heroSkillsValue
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((name) => ({ name, image: "" })),
      };
    }

    return { title: "", items: [] };
  })();

  return (
    <section id="hero" className="relative flex flex-col items-center justify-between py-4 lg:py-12">
      <Image
        src="/hero.svg"
        alt="Hero"
        width={1572}
        height={795}
        className="absolute -top-[98px] -z-10"
      />

      <div className="relative overflow-hidden rounded-[1.7rem] border border-[#2b3046] bg-[linear-gradient(180deg,rgba(30,33,49,0.96),rgba(27,30,44,0.96))] shadow-[0_24px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/6" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-violet-600" />
        <div className="absolute inset-x-0 bottom-0 h-[2px] rotate-180 bg-gradient-to-r from-transparent via-pink-500 to-violet-600" />
        <div className="flex items-center gap-2 border-b border-[#2b3042] px-5 py-4">
          <div className="h-3 w-3 rounded-full bg-red-400"></div>
          <div className="h-3 w-3 rounded-full bg-orange-400"></div>
          <div className="h-3 w-3 rounded-full bg-green-200"></div>
        </div>

        <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
          <div className="order-1 border-b border-[#2b3042] bg-[#e8e2d9] p-4 lg:border-b-0 lg:border-r lg:p-5">
            <div className="relative h-full overflow-hidden rounded-[1.35rem] border border-[#c8bdaf] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
              <Image
                src={heroImage}
                alt={profile?.name || "Profile"}
                width={900}
                height={980}
                priority
                className="h-full min-h-[320px] w-full object-cover object-top sm:min-h-[420px] lg:min-h-[620px]"
              />
            </div>
          </div>

          <div className="order-2 bg-gradient-to-r from-[#0d1224] to-[#0a0d37]">
            <div className="flex h-full overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              <div className="flex w-full flex-col justify-center">
                <p
                  className="text-xs text-[#f4efe8] sm:text-sm md:text-base"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  <span className="text-pink-500">&lt;span&gt;</span>
                  <TypeLines
                    key={nameLines.join("|")}
                    lines={nameLines}
                    className="mx-1 inline-block align-top text-white"
                    typingSpeed={55}
                    lineDelay={260}
                    cursorClassName="text-white"
                    lineClassName="block min-h-[1.2em]"
                  />
                  <span className="text-pink-100">&lt;/span&gt;</span>
                </p>

                <p
                  className="mt-4 max-w-full text-base leading-7 text-[#f6f2eb] sm:text-lg md:text-xl lg:mt-5 lg:text-2xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  <span className="text-pink-500">&lt;span&gt;</span>
                  <TypeLines
                    key={designationLines.join("|")}
                    lines={designationLines}
                    className="mx-2 inline-block max-w-full align-bottom text-[#7a61ff] tracking-[0.08em]"
                    typingSpeed={24}
                    lineDelay={220}
                    cursorClassName="text-[#7a61ff]"
                    lineClassName="inline-block max-w-full whitespace-normal break-words"
                  />
                  <span className="text-pink-500">&lt;/span&gt;</span>
                </p>

                <p className="mt-5 max-w-3xl font-mono text-sm leading-7 text-[#d3d8e8] sm:text-[0.98rem] sm:leading-8 md:text-base lg:mt-6">
                  <span className="text-pink-500">&lt;p&gt;</span>
                  <span className="mx-1">{heroDescription}</span>
                  <span className="text-pink-500">&lt;/p&gt;</span>
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
                  <OpenChatButton
                    className="rounded-full bg-gradient-to-r from-violet-600 to-pink-500 p-[1px] transition-all duration-300 hover:from-pink-500 hover:to-violet-600"
                  >
                    <span className="flex items-center gap-1 rounded-full border-none bg-[#0d1224] px-3 py-3 text-center text-[0.68rem] font-medium uppercase tracking-wider text-white no-underline transition-all duration-200 ease-out hover:gap-3 sm:px-5 sm:text-xs md:px-8 md:py-4 md:text-sm md:font-semibold">
                      <span>Contact me</span>
                      <RiContactsFill size={16} />
                    </span>
                  </OpenChatButton>

                  <Link
                    className="flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-3 text-center text-[0.68rem] font-medium uppercase tracking-wider text-white no-underline transition-all duration-200 ease-out hover:gap-3 hover:text-white hover:no-underline sm:px-5 sm:text-xs md:px-8 md:py-4 md:text-sm md:font-semibold"
                    role="button"
                    target="_blank"
                    href={resumeUrl}
                  >
                    <span>Download CV</span>
                    <MdDownload size={16} />
                  </Link>
                </div>

                {heroSkills.items.length > 0 && (
                  <div className="mt-8 overflow-hidden rounded-2xl border border-[#24305f] bg-[#0b1120]/70 p-3 sm:mt-10 sm:p-4">
                    <div className="mb-4 h-px bg-gradient-to-r from-transparent via-pink-500 to-violet-500" />
                    {heroSkills.title ? (
                      <div className="mb-4 flex items-center gap-3">
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500 to-violet-500" />
                        <p className="text-center text-sm font-medium tracking-[0.08em] text-[#d6d9e7] sm:text-base">
                          {heroSkills.title}
                        </p>
                        <span className="h-px flex-1 bg-gradient-to-r from-violet-500 via-pink-500 to-transparent" />
                      </div>
                    ) : null}
                    <Marquee
                      gradient={false}
                      speed={55}
                      pauseOnHover={true}
                      pauseOnClick={true}
                      delay={0}
                      play={true}
                      direction="left"
                    >
                      {heroSkills.items.map((skill, index) => (
                        <div
                          className="mx-1.5 flex min-h-[84px] w-[92px] min-w-[92px] flex-col items-center justify-center rounded-xl border border-[#1f223c] bg-[#11152c] px-2 py-3 transition-all duration-300 hover:border-violet-500"
                          key={`${skill.name}-${index}`}
                        >
                          {(() => {
                            const resolvedImage = skill.image || skillsImage(skill.name)?.src || "";

                            return (
                              <div className="flex h-[20px] items-center justify-center">
                                {resolvedImage ? (
                                  <Image
                                    src={resolvedImage}
                                    alt={skill.name}
                                    width={20}
                                    height={20}
                                    className="h-[20px] w-auto object-contain"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#32416f] bg-[#162243] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8fdcff]">
                                    {skill.name.slice(0, 2)}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          <p className="mt-2 text-center text-[11px] leading-4 text-white">
                            {skill.name}
                          </p>
                        </div>
                      ))}
                    </Marquee>
                    <div className="mt-4 h-px bg-gradient-to-r from-transparent via-violet-500 to-pink-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
