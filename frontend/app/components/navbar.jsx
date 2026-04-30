"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineBars3BottomLeft } from "react-icons/hi2";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { getSocialIconOption } from "@/utils/social-icons";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Service", href: "/service" },
  { label: "Project", href: "/portfolio" },
  { label: "Pricing", href: "/pricing" },
  { label: "Artical", href: "/artical" },
  { label: "Contact", href: "/contact" },
];

function Navbar({ profile, settings, emergencyContacts = [] }) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const brandTitle = settings?.navTitle || settings?.websiteTitle || "SHAGOR";
  const brandSubtitle = settings?.navSubtitle || "Software Developer";
  const visibleEmergencyContacts = (emergencyContacts || []).filter(
    (item) => item?.label && item?.name && item?.icon && item?.link,
  );
  const socialLinks = (profile?.socialLinks || [])
    .map((item) => {
      const config = getSocialIconOption(item?.icon);
      if (!item?.link) {
        return null;
      }

      return {
        href: item.link,
        icon: config?.icon || null,
        label: item?.label || config?.label || "Social Link",
      };
    })
    .filter((item) => item && item.icon);
  const desktopContactItems = [
    settings?.contactEmail?.trim()
      ? {
          key: `email-${settings.contactEmail}`,
          label: "Email",
          name: settings.contactEmail.trim(),
          link: `mailto:${settings.contactEmail.trim()}`,
          icon: Mail,
        }
      : null,
    settings?.mobileNumber?.trim()
      ? {
          key: `phone-${settings.mobileNumber}`,
          label: "Mobile",
          name: settings.mobileNumber.trim(),
          link: `tel:${settings.mobileNumber.trim()}`,
          icon: Phone,
        }
      : null,
    ...visibleEmergencyContacts.map((item) => {
      const config = getSocialIconOption(item.icon);
      return {
        key: `${item.label}-${item.name}-${item.link}`,
        label: item.label,
        name: item.name,
        link: item.link,
        icon: config?.icon || HiOutlineBars3BottomLeft,
      };
    }),
  ].filter(Boolean);
  useEffect(() => {
    function handleScroll() {
      setIsStickyVisible(window.scrollY > 140);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const desktopNavShell = (
    <div className="navbar-shell relative overflow-hidden rounded-2xl border border-[#2c3145] bg-[linear-gradient(180deg,rgba(30,33,49,0.96),rgba(27,30,44,0.96))] shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/6" />
      <div className="navbar-line absolute inset-x-0 top-0 h-[2px]" />
      <div className="navbar-line absolute inset-x-0 bottom-0 h-[2px] rotate-180" />

      <div className="flex min-h-[86px] flex-col lg:flex-row lg:items-center">
        <div className="flex items-center border-b border-[#2b3042] bg-[linear-gradient(180deg,#262b3c,#222636)] lg:w-[72px] lg:justify-center lg:self-stretch lg:border-b-0 lg:border-r 2xl:w-[86px]">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-[86px] w-[72px] items-center justify-center text-[#f4efe6] transition hover:bg-white/5 2xl:w-[86px]"
          >
            <HiOutlineBars3BottomLeft size={28} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 px-4 py-4 lg:grid lg:grid-cols-[minmax(170px,220px)_minmax(0,1fr)_auto] lg:items-center lg:gap-3 2xl:grid-cols-[minmax(220px,auto)_minmax(0,1fr)_auto] 2xl:px-6 2xl:gap-6">
          <Link href="/" className="flex items-center gap-2 text-white 2xl:gap-3">
            <span
              className="text-[1.95rem] leading-none tracking-tight text-[#f3ede2] 2xl:text-[2.55rem]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {brandTitle}
            </span>
            <span
              className="-translate-y-2 self-start whitespace-nowrap text-[0.72rem] leading-none text-[#b8b0a4] 2xl:text-[0.8rem] 2xl:leading-[1.05]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {brandSubtitle}
            </span>
          </Link>

          <ul className="flex flex-nowrap items-center justify-center gap-0.5 overflow-hidden 2xl:gap-x-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`whitespace-nowrap rounded-full px-2 py-2 text-[0.88rem] transition 2xl:px-3 2xl:text-[1rem] ${
                        isActive
                          ? "bg-[linear-gradient(180deg,#31374d,#2a3042)] text-[#fff8ef] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.03)]"
                          : "text-[#c1b9ad] hover:bg-white/5 hover:text-[#f3ede2]"
                      }`}
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
          </ul>

          <ul className="flex flex-nowrap items-center gap-2 text-[#f3ede2] 2xl:gap-4">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      target="_blank"
                      aria-label={item.label}
                      className="transition hover:text-[#c1b9ad]"
                    >
                      <Icon size={16} />
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );

  const mobileNavShell = (
    <div className="navbar-shell relative overflow-hidden rounded-2xl border border-[#2c3145] bg-[linear-gradient(180deg,rgba(30,33,49,0.96),rgba(27,30,44,0.96))] shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/6" />
      <div className="navbar-line absolute inset-x-0 top-0 h-[2px]" />
      <div className="navbar-line absolute inset-x-0 bottom-0 h-[2px] rotate-180" />

      <div className="flex min-h-[78px] items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex min-w-0 items-end gap-2 text-white">
          <span
            className="truncate text-[1.65rem] leading-none tracking-tight text-[#f3ede2]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {brandTitle}
          </span>
          <span
            className="truncate pb-0.5 text-[0.78rem] text-[#b8b0a4]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {brandSubtitle}
          </span>
        </Link>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={isDrawerOpen}
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#f4efe6] transition hover:bg-white/8"
        >
          <HiOutlineBars3BottomLeft size={24} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <nav className="pt-4">
        {mobileNavShell}
        <div className="hidden lg:block">
          {desktopNavShell}
        </div>
      </nav>
      <div className={isStickyVisible ? "h-[118px]" : ""} />
      <div
        className={`fixed inset-x-0 top-0 z-[110] mx-auto w-full px-6 pt-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] ${
          isStickyVisible
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-8 opacity-0"
        }`}
      >
        {mobileNavShell}
        <div className="hidden lg:block">
          {desktopNavShell}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[120] transition ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isDrawerOpen}
      >
        <div
          onClick={() => setIsDrawerOpen(false)}
          className={`absolute inset-0 bg-[#020611]/60 backdrop-blur-[2px] transition duration-300 ${
            isDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute inset-y-0 right-0 flex w-[min(88vw,340px)] flex-col border-l border-[#2d3a52] bg-[linear-gradient(180deg,#0d1422,#0a101b)] shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition duration-300 lg:hidden ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="border-b border-[#223047] px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#84deff]">Menu</p>
                <h5
                  className="mt-2 truncate text-2xl text-[#f3ede2]"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {brandTitle}
                </h5>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#c8d2df] transition hover:border-[#72ddff]/35 hover:text-white"
              >
                X
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`group flex items-center justify-between rounded-[20px] border px-4 py-4 transition ${
                      isActive
                        ? "border-[#72ddff]/35 bg-[#112033] text-white"
                        : "border-white/[0.08] bg-white/[0.04] text-[#d6deea] hover:border-[#72ddff]/35 hover:bg-[#112033]"
                    }`}
                  >
                    <span
                      className="text-[1.05rem]"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {item.label}
                    </span>
                    <span className="text-[#9db7d4] transition group-hover:text-white">-&gt;</span>
                  </Link>
                );
              })}
            </div>

            {visibleEmergencyContacts.length > 0 ? (
              <div className="mt-8">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#84deff]">Quick Links</p>
                <div className="mt-4 space-y-3">
                  {visibleEmergencyContacts.map((item) => {
                    const config = getSocialIconOption(item.icon);
                    const Icon = config?.icon || HiOutlineBars3BottomLeft;

                    return (
                      <Link
                        key={`${item.label}-${item.name}-${item.link}`}
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setIsDrawerOpen(false)}
                        className="group flex items-center gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.04] px-4 py-4 transition hover:border-[#72ddff]/35 hover:bg-[#112033]"
                      >
                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#315175] bg-[linear-gradient(135deg,rgba(107,212,255,0.18),rgba(17,32,51,0.95))] text-[#8fe3ff]">
                          <Icon size={20} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] uppercase tracking-[0.22em] text-[#8fa4bd]">
                            {item.label}
                          </span>
                          <span className="mt-1 block truncate text-[1rem] text-white">{item.name}</span>
                        </span>
                        <span className="text-[#b8c3d1] transition group-hover:text-white">-&gt;</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#223047] px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#84deff]">Social</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    aria-label={item.label}
                    onClick={() => setIsDrawerOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-[#f3ede2] transition hover:border-[#72ddff]/35 hover:text-[#8ce6ff]"
                  >
                    <Icon size={16} />
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <aside
          className={`absolute inset-y-0 left-0 hidden w-[min(34vw,420px)] flex-col border-r border-[#2d3a52] bg-[linear-gradient(180deg,#0d1422,#0a101b)] shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition duration-300 lg:flex ${
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="border-b border-[#223047] px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#84deff]">Contact</p>
                <h5
                  className="mt-2 truncate text-2xl text-[#f3ede2]"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {brandTitle}
                </h5>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#c8d2df] transition hover:border-[#72ddff]/35 hover:text-white"
              >
                X
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="group relative overflow-hidden rounded-[28px] border border-cyan-100/[0.1] bg-slate-950/45 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.55),transparent)] opacity-70" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/16" />

              <div className="relative mx-auto max-w-2xl text-center">
                <div className="flex justify-center">
                  <div className="relative inline-flex items-center gap-0">
                    <span className="h-[2px] w-8 bg-[linear-gradient(90deg,transparent,#2f5f8b)]" />
                    <div className="relative overflow-hidden rounded-xl border border-[#35506f] bg-[linear-gradient(180deg,#14243a,#0d1728)] px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(112,213,255,0.95),rgba(255,214,102,0.75),transparent)]" />
                      <h5 className="relative text-[11px] font-medium uppercase tracking-[0.28em] text-white">
                        Get In Touch
                      </h5>
                    </div>
                    <span className="h-[2px] w-8 bg-[linear-gradient(90deg,#2f5f8b,transparent)]" />
                  </div>
                </div>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#b8c7d8]">
                  I&apos;m always excited to take on new projects and collaborate with innovative minds.
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                {desktopContactItems.length > 0 ? (
                  desktopContactItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setIsDrawerOpen(false)}
                        className="group/item flex min-w-0 items-center gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-cyan-200/25 hover:bg-cyan-100/[0.06] hover:shadow-[0_16px_44px_rgba(8,145,178,0.12)]"
                      >
                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100/10 bg-[linear-gradient(135deg,rgba(103,232,249,0.16),rgba(16,185,129,0.1))] text-cyan-100 shadow-[0_0_30px_rgba(103,232,249,0.08)] transition group-hover/item:border-cyan-200/25 group-hover/item:text-cyan-50">
                          <Icon size={21} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                            {item.label}
                          </span>
                          <span className="mt-1 block truncate text-sm font-medium text-slate-100">
                            {item.name}
                          </span>
                        </span>
                        <ArrowUpRight className="shrink-0 text-slate-500 transition group-hover/item:text-cyan-100" size={17} aria-hidden="true" />
                      </Link>
                    );
                  })
                ) : (
                  <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
                    No contact links available right now.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#223047] px-6 py-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#84deff]">Social</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    aria-label={item.label}
                    onClick={() => setIsDrawerOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-[#f3ede2] transition hover:border-[#72ddff]/35 hover:text-[#8ce6ff]"
                  >
                    <Icon size={16} />
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default Navbar;
