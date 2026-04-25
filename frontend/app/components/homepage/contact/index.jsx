"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { getSocialIconOption } from "@/utils/social-icons";
import ContactForm from "./contact-form";
import SectionHeading from "../section-heading";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function ContactSection({ profile, settings, emergencyContacts = [] }) {
  const visibleEmergencyContacts = (emergencyContacts || []).filter(
    (item) => item?.label && item?.name && item?.icon && item?.link,
  );

  return (
    <section id="contact" className="my-12 text-white lg:my-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        transition={{ staggerChildren: 0.1 }}
        className="relative overflow-hidden rounded-[2rem] border border-[#25213b] bg-[radial-gradient(circle_at_top,rgba(77,196,255,0.16),transparent_28%),linear-gradient(180deg,rgba(16,23,45,0.96),rgba(9,14,28,0.98))] px-4 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.25)] sm:px-6 sm:py-10 lg:px-8 lg:py-12"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(77,196,255,0.2),transparent_28%),radial-gradient(circle_at_88%_20%,rgba(125,240,202,0.13),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(36,86,160,0.22),transparent_36%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(125,211,252,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.16)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="pointer-events-none absolute left-1/2 top-8 h-48 w-[70%] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-16 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.46),transparent)]" />

        <motion.header
          variants={fadeUp}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-4xl text-center"
        >
          <SectionHeading
            label={
              <span className="inline-flex items-center gap-2">
                <Sparkles size={14} aria-hidden="true" />
                Contact
              </span>
            }
            title={"Let's shape your next digital experience with care."}
            description={
              settings?.websiteDescription ||
              "Share your project scope, timeline, or support request. You will get a focused next step without unnecessary back-and-forth."
            }
            className="mb-2"
          />
        </motion.header>

        <div className="relative mt-8 grid grid-cols-1 gap-4 sm:gap-5 lg:mt-14 lg:grid-cols-12 lg:gap-6 xl:gap-7">
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <ContactForm settings={settings} />
          </motion.div>

          <motion.aside
            variants={fadeUp}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-5 lg:col-span-5"
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-[28px] border border-cyan-100/[0.1] bg-slate-950/45 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:p-6"
            >
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.55),transparent)] opacity-70" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/16" />

              <div className="relative mx-auto max-w-2xl text-center">
                <div className="flex justify-center">
                  <div className="relative inline-flex items-center gap-0">
                    <span className="h-[2px] w-8 bg-[linear-gradient(90deg,transparent,#2f5f8b)] sm:w-14" />
                    <div className="relative overflow-hidden rounded-xl border border-[#35506f] bg-[linear-gradient(180deg,#14243a,#0d1728)] px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-5">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(112,213,255,0.95),rgba(255,214,102,0.75),transparent)]" />
                      <h5 className="relative text-[11px] font-medium uppercase tracking-[0.24em] text-white sm:text-sm sm:tracking-[0.35em]">
                        Get In Touch
                      </h5>
                    </div>
                    <span className="h-[2px] w-8 bg-[linear-gradient(90deg,#2f5f8b,transparent)] sm:w-14" />
                  </div>
                </div>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#b8c7d8] sm:mt-5 sm:text-lg sm:leading-8">
                  I&apos;m always excited to take on new projects and collaborate with innovative minds.
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                {visibleEmergencyContacts.length > 0 ? (
                  visibleEmergencyContacts.map((item) => {
                    const iconConfig = getSocialIconOption(item.icon);
                    const Icon = iconConfig?.icon;

                    return (
                      <Link
                        key={`${item.label}-${item.name}-${item.link}`}
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <motion.div
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.22 }}
                          className="group/item flex min-w-0 items-center gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-cyan-200/25 hover:bg-cyan-100/[0.06] hover:shadow-[0_16px_44px_rgba(8,145,178,0.12)]"
                        >
                          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100/10 bg-[linear-gradient(135deg,rgba(103,232,249,0.16),rgba(16,185,129,0.1))] text-cyan-100 shadow-[0_0_30px_rgba(103,232,249,0.08)] transition group-hover/item:border-cyan-200/25 group-hover/item:text-cyan-50">
                            {Icon ? <Icon size={21} aria-hidden="true" /> : <ArrowUpRight size={20} aria-hidden="true" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                              {item.label}
                            </span>
                            <span className="mt-1 block truncate text-sm font-medium text-slate-100 sm:text-base">
                              {item.name}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="shrink-0 text-slate-500 transition group-hover/item:text-cyan-100"
                            size={17}
                            aria-hidden="true"
                          />
                        </motion.div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
                    No contact links available right now.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.aside>
        </div>
      </motion.div>
    </section>
  );
}

export default ContactSection;
