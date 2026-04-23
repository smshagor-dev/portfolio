"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
} from "lucide-react";
import ContactForm from "./contact-form";

const contactItems = [
  {
    label: "Email",
    icon: Mail,
    getValue: ({ contactEmail }) => contactEmail,
    hrefPrefix: "mailto:",
  },
  {
    label: "Phone",
    icon: Phone,
    getValue: ({ mobileNumber }) => mobileNumber,
    hrefPrefix: "tel:",
  },
  {
    label: "Location",
    icon: MapPin,
    getValue: ({ profile }) => profile?.address,
  },
];

const socialItems = [
  { label: "GitHub", getHref: (profile) => profile?.github },
  { label: "LinkedIn", getHref: (profile) => profile?.linkedIn },
  { label: "Twitter", getHref: (profile) => profile?.twitter },
  { label: "Stack Overflow", getHref: (profile) => profile?.stackOverflow },
  { label: "Facebook", getHref: (profile) => profile?.facebook },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function ContactSection({ profile, settings }) {
  const contactEmail = settings?.contactEmail || profile?.email;
  const mobileNumber = settings?.mobileNumber || profile?.phone;
  const visibleContactItems = contactItems
    .map((item) => ({ ...item, value: item.getValue({ contactEmail, mobileNumber, profile }) }))
    .filter((item) => item.value);
  const visibleSocialItems = socialItems
    .map((item) => ({ ...item, href: item.getHref(profile) }))
    .filter((item) => item.href);

  return (
    <section id="contact" className="my-12 text-white lg:my-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        transition={{ staggerChildren: 0.1 }}
        className="relative overflow-hidden rounded-[32px] border border-cyan-200/[0.08] bg-[linear-gradient(145deg,#07111f_0%,#09192c_38%,#06101d_100%)] px-4 py-8 shadow-[0_32px_100px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-6 sm:py-10 lg:px-8 lg:py-12"
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
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.34em] text-cyan-100 shadow-[0_0_32px_rgba(77,196,255,0.14)] backdrop-blur-xl">
            <Sparkles size={14} aria-hidden="true" />
            Contact
          </div>
          <h2 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Let&apos;s shape your next digital experience with care.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-7 text-slate-300 sm:text-base">
            {settings?.websiteDescription ||
              "Share your project scope, timeline, or support request. You will get a focused next step without unnecessary back-and-forth."}
          </p>
        </motion.header>

        <div className="relative mt-10 grid grid-cols-1 gap-5 lg:mt-14 lg:grid-cols-12 lg:gap-6 xl:gap-7">
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

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                    Direct Details
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                    Fast ways to reach me
                  </h3>
                </div>
                <span className="rounded-2xl border border-cyan-100/10 bg-cyan-100/[0.06] p-3 text-cyan-100">
                  <MessageSquare size={20} aria-hidden="true" />
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Prefer a direct channel? Use the saved portfolio contact details below and I will keep the conversation focused.
              </p>

              <div className="mt-6 grid gap-3">
                {visibleContactItems.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.22 }}
                      className="group/item flex min-w-0 items-center gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-cyan-200/25 hover:bg-cyan-100/[0.06] hover:shadow-[0_16px_44px_rgba(8,145,178,0.12)]"
                    >
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100/10 bg-[linear-gradient(135deg,rgba(103,232,249,0.16),rgba(16,185,129,0.1))] text-cyan-100 shadow-[0_0_30px_rgba(103,232,249,0.08)] transition group-hover/item:border-cyan-200/25 group-hover/item:text-cyan-50">
                        <Icon size={21} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          {item.label}
                        </span>
                        <span className="mt-1 block truncate text-sm font-medium text-slate-100 sm:text-base">
                          {item.value}
                        </span>
                      </span>
                      {item.hrefPrefix ? (
                        <ArrowUpRight
                          className="shrink-0 text-slate-500 transition group-hover/item:text-cyan-100"
                          size={17}
                          aria-hidden="true"
                        />
                      ) : null}
                    </motion.div>
                  );

                  return item.hrefPrefix ? (
                    <Link key={item.label} href={`${item.hrefPrefix}${item.value}`}>
                      {content}
                    </Link>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>
            </motion.div>

            {visibleSocialItems.length > 0 ? (
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-[28px] border border-cyan-100/[0.1] bg-slate-950/40 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl sm:p-6"
              >
                <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-blue-400/10 blur-3xl transition group-hover:bg-blue-300/14" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                      Social Links
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
                      More places to connect
                    </h3>
                  </div>
                  <ExternalLink className="text-cyan-100/70" size={20} aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Explore work, updates, and professional profiles across active channels.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {visibleSocialItems.map((item) => (
                    <Link
                      key={item.label}
                      target="_blank"
                      rel="noreferrer"
                      href={item.href}
                      aria-label={item.label}
                      className="group/social rounded-[20px] border border-white/[0.08] bg-white/[0.045] px-3 py-4 text-center transition duration-300 hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-cyan-100/[0.065] hover:shadow-[0_16px_44px_rgba(8,145,178,0.14)]"
                    >
                      <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-100/10 bg-slate-900/70 text-sm font-semibold text-cyan-100 transition group-hover/social:border-cyan-200/30 group-hover/social:bg-cyan-100/[0.08]">
                        {item.label.slice(0, 1)}
                      </span>
                      <span className="mt-3 block truncate text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </motion.aside>
        </div>
      </motion.div>
    </section>
  );
}

export default ContactSection;
