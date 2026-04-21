"use client";

import { usePathname } from "next/navigation";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login/admin";
}

export default function LayoutShell({ children, navbar, footer, scrollToTop }) {
  const pathname = usePathname();
  const hidePublicChrome = isAdminPath(pathname);

  if (hidePublicChrome) {
    return (
      <main className="min-h-screen bg-[#09111f] text-white">
        {children}
      </main>
    );
  }

  return (
    <>
      <main className="relative mx-auto min-h-screen px-6 text-white sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem]">
        {navbar}
        {children}
        {scrollToTop}
      </main>
      {footer}
    </>
  );
}
