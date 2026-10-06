const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/sm-shagor/";

export default function LinkedInProfileSection() {
  return (
    <section id="linkedin-updates" className="my-12 lg:my-20" aria-labelledby="linkedin-profile-title">
      <div className="flex flex-col gap-6 rounded-[2rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#08111d)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0a66c2] text-2xl font-bold text-white">in</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9dfff]">Connect on LinkedIn</p>
            <h2 id="linkedin-profile-title" className="mt-2 text-xl font-semibold text-white sm:text-2xl">Shahanur Islam Shagor</h2>
            <p className="mt-2 text-sm text-[#b8c7d8]">Full-Stack Web Developer & AI Engineer</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#91a4bc]">Follow my work in software engineering, AI and developer tools, or visit my profile to connect.</p>
          </div>
        </div>
        <a href={LINKEDIN_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#0a66c2] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b72d5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#70d5ff] lg:w-auto">View profile & follow <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
