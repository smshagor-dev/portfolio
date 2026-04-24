"use client";

import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("./navbar"), {
  ssr: false,
});

const ToastProvider = dynamic(() => import("./toast-provider"), {
  ssr: false,
});

const ScrollToTop = dynamic(() => import("./helper/scroll-to-top"), {
  ssr: false,
});

export default function LayoutClientChrome({ kind, profile, settings, emergencyContacts }) {
  if (kind === "navbar") {
    return <Navbar profile={profile} settings={settings} emergencyContacts={emergencyContacts} />;
  }

  if (kind === "scrollToTop") {
    return <ScrollToTop />;
  }

  if (kind === "toast") {
    return <ToastProvider />;
  }

  return null;
}
