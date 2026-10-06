const STUDIO_URL = "https://studio.openmindai.org";

const capabilities = [
  { title: "A focused code editor", description: "Edit projects with Monaco, multi-file tabs and a familiar workspace." },
  { title: "App-local runtimes", description: "Choose the language tools your projects need and manage them in one place." },
  { title: "Practical portable workflows", description: "Build on personal, university and office PCs with packages suited to your setup." },
];

export default function OpenMindStudioPromo() {
  return (
    <section id="openmind-studio" className="my-12 lg:my-20" aria-labelledby="openmind-studio-title">
      <div className="overflow-hidden rounded-[2rem] border border-[#34345a] bg-[linear-gradient(180deg,#13172b,#0a1120)] shadow-[0_26px_80px_rgba(0,0,0,0.28)]">
        <div className="grid items-center gap-8 px-5 py-8 sm:px-7 md:p-10 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b6a7ff]">Developer tools · OpenMind ecosystem</p>
            <h2 id="openmind-studio-title" className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">OpenMind Studio</h2>
            <p className="mt-3 text-xl font-medium text-[#d5cbff]">Code freely. Work anywhere.</p>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#aebcd2]">A desktop development workspace that brings your editor, terminals, language tools and app-local runtimes together. Built for everyday coding on personal computers, university labs and office PCs.</p>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="OpenMind Studio capabilities">
              {["Monaco editor", "Runtime Manager", "Integrated terminal", "Local development"].map(label => <span key={label} className="rounded-full border border-[#393653] bg-[#211d37]/60 px-3 py-1.5 text-xs text-[#c9c3df]">{label}</span>)}
            </div>
          </div>
          <div className="min-w-0 overflow-hidden rounded-2xl border border-[#383653] bg-[#0b1020] shadow-xl" role="img" aria-label="Illustration of the OpenMind Studio code editor and terminal">
            <div className="flex items-center gap-2 border-b border-[#292d43] px-4 py-3" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-[#fd6b73]"/><span className="h-2.5 w-2.5 rounded-full bg-[#ecc46c]"/><span className="h-2.5 w-2.5 rounded-full bg-[#6dcaa0]"/><span className="ml-3 text-xs text-[#a0a8bd]">OpenMind Studio — workspace</span></div>
            <div className="grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[120px_minmax(0,1fr)]" aria-hidden="true">
              <div className="border-r border-[#292d43] p-3 text-[10px] leading-7 text-[#7f8ba4] sm:text-xs"><p className="mb-2 font-semibold text-[#b2bbcc]">EXPLORER</p><p>▾ src</p><p className="text-[#baacff]">main.ts</p><p>app.rs</p><p>styles.css</p><p>README.md</p></div>
              <div className="min-w-0"><div className="border-b border-[#292d43] px-4 py-3 text-xs text-[#d0c5ff]">main.ts</div><div className="overflow-x-auto p-4 font-mono text-[11px] leading-7 sm:text-xs"><p className="text-[#b5a3ff]">const workspace = &#123;</p><p className="whitespace-nowrap text-[#88d6c4]">&nbsp; editor: &quot;Monaco&quot;,</p><p className="whitespace-nowrap text-[#88d6c4]">&nbsp; tools: &quot;app-local&quot;,</p><p className="whitespace-nowrap text-[#88d6c4]">&nbsp; focus: &quot;your next idea&quot;</p><p className="text-[#b5a3ff]">&#125;;</p></div><div className="border-t border-[#292d43] bg-[#080d17] px-4 py-3 font-mono text-[11px] text-[#81c7b5]">$ ready to build<span className="ml-2 text-[#b8a4ff]">▍</span></div></div>
            </div>
          </div>
        </div>
        <div className="grid gap-5 border-t border-[#292d43] px-5 py-6 sm:px-7 md:grid-cols-3 md:px-10">
          {capabilities.map(item => <div key={item.title}><h3 className="text-sm font-semibold text-white">{item.title}</h3><p className="mt-2 text-xs leading-6 text-[#91a4bc]">{item.description}</p></div>)}
        </div>
        <div className="flex flex-col gap-4 border-t border-[#292d43] bg-[#0b1424] px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <p className="text-xs leading-6 text-[#91a4bc]">Explore features, installation guides and officially published downloads.</p>
          <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-full bg-[#b5a0ff] px-6 py-3 text-sm font-semibold text-[#100e20] transition hover:bg-[#c5b6ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c5b6ff] sm:w-auto">Explore OpenMind Studio <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
