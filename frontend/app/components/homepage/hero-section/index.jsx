import Image from "next/image";
import Link from "next/link";
import { MdDownload } from "react-icons/md";
import { RiContactsFill } from "react-icons/ri";
import OpenChatButton from "@/app/components/open-chat-button";
import { buildPublicAssetUrl } from "@/lib/public-backend-url";
import { skillsImage } from "@/utils/skill-image";

function normalizeHeroSkills(heroSkillsValue) {
  if (Array.isArray(heroSkillsValue)) {
    return heroSkillsValue
      .map((skill) => {
        if (typeof skill === "string") {
          const name = skill.trim();
          return name ? { name, image: "" } : null;
        }

        const name = skill?.name?.trim?.() || "";
        const image = skill?.image?.trim?.() || "";
        return name ? { name, image } : null;
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  if (heroSkillsValue && typeof heroSkillsValue === "object") {
    return (heroSkillsValue.items || [])
      .map((skill) => {
        const name = skill?.name?.trim?.() || "";
        const image = skill?.image?.trim?.() || "";
        return name ? { name, image } : null;
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  if (typeof heroSkillsValue === "string") {
    return heroSkillsValue
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => ({ name, image: "" }))
      .slice(0, 8);
  }

  return [];
}

export default function HeroSection({ profile }) {
  const heroImage = buildPublicAssetUrl(profile?.profile || "/profile.png");
  const resumeUrl = buildPublicAssetUrl(profile?.jobAgentResumeUrl || profile?.resume || "#");
  const heroSkills = normalizeHeroSkills(profile?.heroSkills);

  return (
    <section id="hero" className="relative flex flex-col items-center justify-between py-4 lg:py-12">
      <Image
        src="/hero.svg"
        alt=""
        width={1572}
        height={795}
        priority
        aria-hidden="true"
        className="absolute -top-[98px] -z-10 h-auto w-full"
      />

      <div className="relative overflow-hidden rounded-[1.7rem] border border-[#2b3046] bg-[linear-gradient(180deg,rgba(30,33,49,0.96),rgba(27,30,44,0.96))] shadow-[0_24px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/6" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-violet-600" />
        <div className="absolute inset-x-0 bottom-0 h-[2px] rotate-180 bg-gradient-to-r from-transparent via-pink-500 to-violet-600" />
        <div className="flex items-center gap-2 border-b border-[#2b3042] px-5 py-4">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-orange-400" />
          <div className="h-3 w-3 rounded-full bg-green-200" />
        </div>

        <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
          <div className="order-1 border-b border-[#2b3042] bg-[#e8e2d9] p-4 lg:border-b-0 lg:border-r lg:p-5">
            <div className="relative aspect-[9/10] overflow-hidden rounded-[1.35rem] border border-[#c8bdaf] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
              <Image
                src={heroImage}
                alt={profile?.name || "Profile"}
                fill
                priority
                fetchPriority="high"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5MDAiIGhlaWdodD0iOTgwIiB2aWV3Qm94PSIwIDAgOTAwIDk4MCI+PHJlY3Qgd2lkdGg9IjkwMCIgaGVpZ2h0PSI5ODAiIGZpbGw9IiMyYjMwNDYiLz48L3N2Zz4="
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="order-2 bg-gradient-to-r from-[#0d1224] to-[#0a0d37]">
            <div className="flex h-full overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              <div className="flex w-full flex-col justify-center">
                <p className="text-xs text-[#f4efe8] sm:text-sm md:text-base" style={{ fontFamily: "var(--font-serif)" }}>
                  <span className="text-pink-500">&lt;span&gt;</span>
                  <span className="mx-1 inline-block align-top text-white">
                    {profile?.name || "Your Name"}
                  </span>
                  <span className="text-pink-500">&lt;/span&gt;</span>
                </p>

                <h1
                  className="mt-4 max-w-full text-base leading-7 text-[#f6f2eb] sm:text-lg md:text-xl lg:mt-5 lg:text-2xl"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  <span className="text-pink-500">&lt;span&gt;</span>
                  <span className="mx-2 inline-block max-w-full align-bottom whitespace-normal break-words text-[#7a61ff] tracking-[0.08em]">
                    {profile?.designation || "Software Developer"}
                  </span>
                  <span className="text-pink-500">&lt;/span&gt;</span>
                </h1>

                <p
                  className="mt-5 max-w-3xl text-justify text-sm leading-7 text-[#d3d8e8] [text-align-last:left] sm:text-[0.98rem] sm:leading-8 md:text-base"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span className="text-pink-500">&lt;p&gt;</span>
                  <span className="mx-1">{profile?.description || ""}</span>
                  <span className="text-pink-500">&lt;/p&gt;</span>
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
                  <OpenChatButton className="rounded-full bg-gradient-to-r from-violet-600 to-pink-500 p-[1px] transition-all duration-300 hover:from-pink-500 hover:to-violet-600">
                    <span className="flex items-center gap-1 rounded-full border-none bg-[#0d1224] px-3 py-3 text-center text-[0.68rem] font-medium uppercase tracking-wider text-white no-underline transition-all duration-200 ease-out hover:gap-3 sm:px-5 sm:text-xs md:px-8 md:py-4 md:text-sm md:font-semibold">
                      <span>Contact me</span>
                      <RiContactsFill size={16} aria-hidden="true" />
                    </span>
                  </OpenChatButton>

                  <Link
                    className="flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-3 text-center text-[0.68rem] font-medium uppercase tracking-wider text-white no-underline transition-all duration-200 ease-out hover:gap-3 hover:text-white hover:no-underline sm:px-5 sm:text-xs md:px-8 md:py-4 md:text-sm md:font-semibold"
                    target="_blank"
                    rel="noreferrer"
                    href={resumeUrl}
                  >
                    <span>Download CV</span>
                    <MdDownload size={16} aria-hidden="true" />
                  </Link>
                </div>

                {heroSkills.length > 0 ? (
                  <div className="mt-8 overflow-hidden rounded-2xl border border-[#24305f] bg-[#0b1120]/70 p-3 sm:mt-10 sm:p-4">
                    <div className="mb-4 h-px bg-gradient-to-r from-transparent via-pink-500 to-violet-500" />
                    <div className="hero-skills-marquee group">
                      <div className="hero-skills-marquee__track">
                        {[...heroSkills, ...heroSkills].map((skill, index) => {
                          const resolvedImage = skill.image || skillsImage(skill.name)?.src || "";

                          return (
                            <div
                              className="flex min-h-[84px] w-[92px] min-w-[92px] flex-col items-center justify-center rounded-xl border border-[#1f223c] bg-[#11152c] px-2 py-3"
                              key={`${skill.name}-${index}`}
                            >
                              <div className="flex h-[20px] items-center justify-center">
                                {resolvedImage ? (
                                  <Image
                                    src={resolvedImage}
                                    alt={skill.name}
                                    width={20}
                                    height={20}
                                    sizes="20px"
                                    className="h-[20px] w-auto object-contain"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#32416f] bg-[#162243] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8fdcff]">
                                    {skill.name.slice(0, 2)}
                                  </div>
                                )}
                              </div>
                              <p className="mt-2 text-center text-[11px] leading-4 text-white">{skill.name}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-4 h-px bg-gradient-to-r from-transparent via-violet-500 to-pink-500" />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
