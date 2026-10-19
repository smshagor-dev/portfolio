// Portfolio-only case studies. Keep product data separate from the CMS-backed projects.
export const founderProjects = [
  {
    slug: "openmindai",
    name: "OpenMindAI",
    eyebrow: "Personal AI · Local-first software",
    tagline: "Your AI. Your Models. Your Way.",
    summary:
      "An AI workspace designed around local models, private conversations, coding, research and multimodal workflows, with the flexibility to work beyond a hosted-only assistant.",
    website: "https://openmindai.org",
    image: "/founder/openmindai-desktop.png",
    imageWidth: 1916,
    imageHeight: 1028,
    imageAlt: "OpenMindAI desktop workspace with Chat and Work modes, prompt input and multimodal tools",
    imageNote: "Product interface screenshot supplied by the founder.",
    tone: "cyan",
    role: ["Founder & CEO", "Lead Software Engineer"],
    focus: ["Offline-first", "Desktop & mobile", "Local LLM inference", "Multimodal workflows"],
    overview:
      "OpenMindAI started with a practical question: what if a capable AI assistant could remain useful on a developer's own machine, including systems with limited connectivity? The product direction brings chat, coding, documents and model management together in a portable experience.",
    principles: [
      { title: "Keep users in control", description: "Local inference and local storage are central design choices, rather than afterthoughts." },
      { title: "One place to work", description: "Connect conversational assistance, model selection, files, and increasingly capable research workflows in one product interface." },
      { title: "Engineer for real hardware", description: "Balance model size, GPU offload, context management and runtime reliability for everyday machines." }
    ],
    journey: [
      { step: "01", title: "Define a local-first assistant", detail: "Shaped the product around privacy-conscious local chat, simple model management and a usable desktop interface." },
      { step: "02", title: "Build the desktop foundation", detail: "Developed a Tauri, Rust and React desktop architecture with persistent conversation data and local model execution." },
      { step: "03", title: "Extend developer workflows", detail: "Added a stronger coding experience, model integration and tooling for practical file-based work." },
      { step: "04", title: "Expand across experiences", detail: "Worked on mobile distribution, multimodal entry points and research-oriented web capabilities." },
      { step: "05", title: "Iterate on reliability", detail: "Continuing performance, context, inference and release validation work so the assistant remains practical on real devices." }
    ],
    stack: ["Tauri", "Rust", "React", "TypeScript", "SQLite", "llama.cpp"],
    outcome:
      "A continuously evolving local AI product, shaped by hands-on desktop development, release engineering and real-world runtime constraints.",
  },
  {
    slug: "openmind-studio",
    name: "OpenMind Studio",
    eyebrow: "Developer tools · Portable IDE",
    tagline: "Code anywhere.",
    summary:
      "A desktop coding environment that brings the editor, project explorer, terminal, portable language runtimes and an integrated AI coding assistant into one workspace.",
    website: "https://studio.openmindai.org",
    image: "/founder/openmind-studio-desktop.png",
    imageWidth: 1708,
    imageHeight: 921,
    imageAlt: "OpenMind Studio editor concept showing a React project, integrated terminal and OpenMindAI Agent Lite",
    imageNote: "Founder-provided product concept preview; the illustration is not a verified live application screenshot.",
    tone: "violet",
    role: ["Founder & CEO", "Lead Software Engineer"],
    focus: ["Portable IDE", "Integrated AI agent", "Developer tooling", "Collaboration R&D"],
    overview:
      "OpenMind Studio grew out of a concrete developer problem: working on PCs where installing a full toolchain or changing system configuration is not always possible. It aims to make a capable code workspace portable, familiar and reliable.",
    principles: [
      { title: "Build wherever you are", description: "Prioritize tools that can live inside the app's workspace instead of requiring machine-wide installation." },
      { title: "Stay in one environment", description: "Bring editing, terminals, runtime management, project navigation and assistance into a coherent desktop experience." },
      { title: "Design for collaboration", description: "Explore real-time editing, room management, presence and local-first coordination without making connectivity a prerequisite for all work." }
    ],
    journey: [
      { step: "01", title: "Solve the setup problem", detail: "Started with a portable editor workflow for personal machines, classrooms and university computers." },
      { step: "02", title: "Develop the coding workspace", detail: "Brought together editor tabs, file navigation, integrated terminals and cross-language tooling." },
      { step: "03", title: "Add portable runtimes", detail: "Worked on app-managed developer tools including Python, Node.js, PHP and compiled language workflows." },
      { step: "04", title: "Integrate AI coding support", detail: "Developed OpenMindAI Agent Lite interactions for asking questions, explaining code, fixing issues and assisting in-editor." },
      { step: "05", title: "Research connected workspaces", detail: "Expanded into collaborative editing, presence, voice and peer-to-peer connectivity, with ongoing validation and hardening." }
    ],
    stack: ["Tauri", "Rust", "React", "TypeScript", "Monaco", "SQLite", "WebRTC"],
    outcome:
      "A desktop engineering workspace combining portable development tooling with an AI-assisted editing direction and ongoing collaborative features.",
  },
];

export function getFounderProject(slug) {
  return founderProjects.find((project) => project.slug === slug);
}
