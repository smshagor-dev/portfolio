// @flow strict
import Link from "next/link";
import { getSocialIconOption } from "@/utils/social-icons";

function Footer({ profile, settings }) {
  const currentYear = new Date().getFullYear();
  const footerText = settings?.footerText || "Developer Portfolio";
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
    <div className="relative border-t border-[#353951] bg-[#0d1224] text-white">
      <div className="mx-auto px-6 py-6 sm:px-12 lg:max-w-[70rem] lg:py-10 xl:max-w-[76rem] 2xl:max-w-[92rem]">
        <div className="flex justify-center -z-40">
          <div className="absolute top-0 h-[1px] w-1/2 bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-[#c8d3e1] md:text-left">
            © {currentYear} {footerText}
          </p>
          {socialLinks.length > 0 ? (
            <ul className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={`${item.label}-${item.href}`}>
                    <Link
                      target="_blank"
                      href={item.href}
                      aria-label={item.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#d9e7f6] transition hover:-translate-y-0.5 hover:border-[#16f2b3]/40 hover:bg-[#16f2b3]/10 hover:text-[#16f2b3]"
                    >
                      <Icon size={16} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Footer;
