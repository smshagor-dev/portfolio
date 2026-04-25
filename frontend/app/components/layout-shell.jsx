"use client";

import { usePathname } from "next/navigation";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login/admin";
}

function isChatPath(pathname) {
  return pathname === "/chat" || pathname.startsWith("/chat/");
}

export default function LayoutShell({ children, navbar, footer, scrollToTop }) {
  const pathname = usePathname();
  const hidePublicChrome = isAdminPath(pathname);
  const isChatRoute = isChatPath(pathname);

  if (hidePublicChrome) {
    return (
      <main className="min-h-screen bg-[#09111f] text-white">
        {children}
      </main>
    );
  }

  if (isChatRoute) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-[#0d1224] text-white">
        <div className="relative z-10 mx-auto w-full shrink-0 px-4 sm:px-6 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem]">
          {navbar}
        </div>
        <main className="relative mx-auto flex-1 min-h-0 w-full overflow-hidden px-0 text-white lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem]">
          {children}
          {scrollToTop}
        </main>
        <div className="shrink-0 overflow-hidden [&_>div]:border-t-[#2c3145] [&_>div>div]:px-4 [&_>div>div]:py-3 sm:[&_>div>div]:px-6 sm:[&_>div>div]:py-3">
          {footer}
        </div>
      </div>
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
