"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineBars3BottomLeft } from "react-icons/hi2";
import { getSocialIconOption } from "@/utils/social-icons";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Service", href: "/service" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Pricing", href: "/pricing" },
  { label: "Artical", href: "/artical" },
  { label: "Contact", href: "/contact" },
];

function Navbar({ profile, settings }) {
  const pathname = usePathname();
  const brandTitle = settings?.websiteTitle || "SHAGOR";
  const brandSubtitle = profile?.designation || settings?.websiteDescription || "Software Developer";
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

  return (
    <nav className="pt-4">
      <div className="navbar-shell relative overflow-hidden rounded-2xl border border-[#2c3145] bg-[linear-gradient(180deg,rgba(30,33,49,0.96),rgba(27,30,44,0.96))] shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/6" />
        <div className="navbar-line absolute inset-x-0 top-0 h-[2px]" />
        <div className="navbar-line absolute inset-x-0 bottom-0 h-[2px] rotate-180" />

        <div className="flex min-h-[86px] flex-col lg:flex-row lg:items-center">
          <div className="flex items-center border-b border-[#2b3042] bg-[linear-gradient(180deg,#262b3c,#222636)] lg:w-[86px] lg:justify-center lg:self-stretch lg:border-b-0 lg:border-r">
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-[86px] w-[86px] items-center justify-center text-[#f4efe6] transition hover:bg-white/5"
            >
              <HiOutlineBars3BottomLeft size={28} />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-5 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <Link href="/" className="flex items-end gap-3 text-white">
              <span
                className="text-[2.55rem] leading-none tracking-tight text-[#f3ede2]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {brandTitle}
              </span>
              <span
                className="pb-1 text-[1rem] text-[#b8b0a4] lg:text-[1.15rem]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {brandSubtitle}
              </span>
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
              <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`rounded-full px-3 py-2 text-[1rem] transition ${
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

              <ul className="flex flex-wrap items-center gap-4 text-[#f3ede2]">
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
      </div>
    </nav>
  );
}

export default Navbar;
