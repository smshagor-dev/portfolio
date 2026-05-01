"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlineViewGrid,
} from "react-icons/hi";
import {
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiCode,
  FiDollarSign,
  FiFolder,
  FiHelpCircle,
  FiLogOut,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiSettings,
} from "react-icons/fi";

const adminTabs = [
  { id: "dashboard", label: "Dashboard", icon: FiBarChart2, href: "/admin/dashboard" },
  { id: "hero", label: "Hero", icon: HiOutlineSparkles, href: "/admin/hero" },
  { id: "services", label: "Services", icon: HiOutlineViewGrid, href: "/admin/services" },
  { id: "research", label: "Research", icon: FiBookOpen, href: "/admin/research" },
  { id: "artical", label: "Artical", icon: FiBookOpen, href: "/admin/artical" },
  { id: "artical-categories", label: "Artical Categories", icon: FiBookOpen, href: "/admin/artical-categories" },
  { id: "projects", label: "Projects", icon: FiFolder, href: "/admin/projects" },
  { id: "pricing", label: "Pricing", icon: FiDollarSign, href: "/admin/pricing" },
  { id: "faq", label: "FAQ", icon: FiHelpCircle, href: "/admin/faq" },
  { id: "ai", label: "AI Settings", icon: FiSettings, href: "/admin/ai" },
  { id: "testimonials", label: "Testimonials", icon: FiMessageSquare, href: "/admin/testimonials" },
  { id: "skills", label: "Skills", icon: FiCode, href: "/admin/skills" },
  { id: "experience", label: "Experience", icon: FiBriefcase, href: "/admin/experience" },
  { id: "education", label: "Education", icon: FiBookOpen, href: "/admin/education" },
  { id: "achievement", label: "Achievements", icon: HiOutlineUsers, href: "/admin/achievement" },
  { id: "counter", label: "Counters", icon: FiBarChart2, href: "/admin/counters" },
  { id: "social", label: "Social", icon: HiOutlineUsers, href: "/admin/social" },
  { id: "contact", label: "Contact", icon: FiPhone, href: "/admin/contact" },
  { id: "messages", label: "Messages", icon: FiMail, href: "/admin/messages" },
  { id: "settings", label: "Settings", icon: FiSettings, href: "/admin/settings" },
];

export default function AdminFixedSidebarShell({ children, title = "Portfolio Admin", description = "" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin] = useState(() => {
    try {
      if (typeof window === "undefined") {
        return null;
      }

      const savedAdmin = localStorage.getItem("portfolio_admin_user");
      if (savedAdmin) {
        return JSON.parse(savedAdmin);
      }
    } catch (_error) {
      return null;
    }

    return null;
  });

  function logout() {
    localStorage.removeItem("portfolio_admin_token");
    localStorage.removeItem("portfolio_admin_user");
    router.replace("/login/admin");
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 space-y-3 sm:hidden">
        <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.94),rgba(7,12,23,0.9))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8fdcff]">Control Center</p>
              <h1 className="mt-2 text-xl font-semibold text-white">{title}</h1>
              {description ? (
                <p className="mt-2 text-sm leading-6 text-[#9fb1c7]">{description}</p>
              ) : null}
            </div>
            <button
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#324966] bg-[#132339] p-3 text-white transition hover:border-[#4dc4ff]"
              onClick={logout}
              type="button"
              aria-label="Logout"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 pb-1">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                pathname === tab.href ||
                (tab.href === "/admin/artical" && pathname.startsWith("/admin/artical/"));

              return (
                <Link
                  key={`mobile-${tab.id}`}
                  href={tab.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-[#4dc4ff]/60 bg-[linear-gradient(135deg,rgba(32,77,121,0.45),rgba(17,34,59,0.82))] text-white"
                      : "border-white/10 bg-white/[0.03] text-[#bfd0e2]"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="hidden lg:block lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.88),rgba(7,12,23,0.82))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_52%),rgba(255,255,255,0.03)] p-5">
            <p className="text-xs uppercase tracking-[0.32em] text-[#8fdcff]">Control Center</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">{title}</h1>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-[#9fb1c7]">{description}</p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-2">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                pathname === tab.href ||
                (tab.href === "/admin/artical" && pathname.startsWith("/admin/artical/"));

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition duration-300 ${
                    isActive
                      ? "border-[#4dc4ff]/60 bg-[linear-gradient(135deg,rgba(32,77,121,0.45),rgba(17,34,59,0.82))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_40px_rgba(0,0,0,0.2)]"
                      : "border-white/8 bg-white/[0.03] text-[#bfd0e2] hover:border-[#36557e] hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#132339] text-[#7fdcff]">
                    <Icon size={18} />
                  </span>
                  <span className="font-medium">{tab.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[#8b98a5]">Signed In</p>
            <p className="mt-3 font-medium text-white">{admin?.name || "Admin"}</p>
            <p className="mt-1 text-sm text-[#a7b7ca]">{admin?.email || "support@smshagor.com"}</p>
            <button
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#324966] bg-[#132339] px-4 py-3 text-sm font-medium text-white transition hover:border-[#4dc4ff]"
              onClick={logout}
              type="button"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
