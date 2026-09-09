import Link from "next/link";
import "ckeditor5/ckeditor5.css";

export default function AdminLayout({ children }) {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_22%),linear-gradient(180deg,#060b14_0%,#0a1321_46%,#09111d_100%)] px-3 py-3 sm:px-6 sm:py-4 lg:px-8"
    >
      <div className="sticky top-3 z-[170] mb-3 flex justify-end pointer-events-none">
        <Link
          href="/admin/linkedin-posts"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#3a6387] bg-[linear-gradient(135deg,rgba(15,39,65,0.96),rgba(9,24,42,0.96))] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9edfff] shadow-[0_16px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:border-[#70d5ff] hover:text-white sm:text-sm"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a66c2] text-sm font-bold normal-case tracking-normal text-white">
            in
          </span>
          <span>LinkedIn Posts</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
