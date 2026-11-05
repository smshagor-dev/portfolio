// Founder-led products shown independently of the database-managed portfolio catalog.
// Editorial copy is based on the public product documentation; preview work is not
// described as a production release or as independently measured performance.
export const founderProjects = [
  {
    slug: "openmindai",
    name: "OpenMindAI",
    eyebrow: "Local-first artificial intelligence · Desktop platform",
    tagline: "Your AI. Your Models. Your Way.",
    summary:
      "A local-first AI workspace that brings model execution, persistent conversations, project files and developer workflows into a single desktop experience.",
    website: "https://openmindai.org",
    repository: "https://github.com/smshagor-dev/OpenMindAI",
    image: "/uploads/founder/openmindai-desktop.webp",
    imageWidth: 640,
    imageHeight: 343,
    imageAlt: "Founder-provided OpenMindAI desktop screenshot showing Chat and Work modes and multimodal workspace actions",
    imageNote: "Founder-provided product screenshot. Web-optimized from the original image.",
    role: ["Founder & CEO", "Lead Software Engineer"],
    focus: ["Local AI inference", "Portable desktop app", "Project workflows", "Runtime management"],
    overview:
      "OpenMindAI began with a practical engineering constraint: useful AI should not require a permanent connection to a hosted inference provider. The product is designed for developers and everyday users who want to manage compatible models and conversations on hardware they already own, while retaining the option to connect to outside services for tasks that need them.",
    context: [
      "The starting problem was not merely to put a chat interface around a language model. A usable local assistant also needs model discovery, downloads, runtime compatibility, persistent storage, sensible defaults and recovery when something goes wrong. Those supporting systems determine whether a desktop AI application remains useful beyond a demonstration.",
      "I approached the product as an integrated workstation. Chat and active Projects share a local-first foundation, while explicit permission boundaries separate ordinary conversation from work that reads files or executes commands. Web search and connected services are optional extensions rather than prerequisites for local inference.",
    ],
    responsibilities: [
      "Product direction, feature prioritization and interface architecture",
      "Desktop integration across Rust, Tauri, React and TypeScript",
      "Local inference integration, runtime lifecycle and model-management workflows",
      "Persistent workspace data, permission boundaries and release engineering",
    ],
    principles: [
      {
        title: "Local capability first",
        description: "Design core conversations and inference to function with a supported downloaded model and runtime, independently of cloud availability.",
      },
      {
        title: "Make complex systems understandable",
        description: "Surface model state, download progress, runtime health and work permissions in product workflows instead of leaving users to debug hidden processes.",
      },
      {
        title: "Treat files and tools with care",
        description: "Keep access to local projects deliberate, scoped and reviewable; make connectivity and external actions explicit when they are required.",
      },
    ],
    journeyIntro:
      "This development narrative follows the engineering decisions that shaped OpenMindAI. The stages describe the product's progression, not invented launch dates or laboratory benchmarks.",
    journey: [
      {
        step: "01",
        title: "Defining the product and its constraints",
        status: "Product foundation",
        lead:
          "I began with the requirements of an assistant intended to run on ordinary personal and shared computers: local data, a predictable setup process, reasonable hardware demands and a clear path from model installation to the first useful response.",
        details: [
          "Established a local-first product boundary: normal on-device inference and conversation storage should not depend on a remote AI subscription after the required assets have been installed.",
          "Separated essential capabilities from optional online integrations, and treated portable storage as an architectural requirement rather than a packaging detail.",
          "Mapped the experience beyond chat to model selection, file-oriented work, diagnostics and future research capabilities.",
        ],
        result:
          "A product direction built around user-controlled execution and a complete operating workflow, rather than a thin interface to a hosted model.",
      },
      {
        step: "02",
        title: "Building the cross-platform desktop foundation",
        status: "Implemented foundation",
        lead:
          "The application was structured with Tauri 2 and Rust for native desktop integration, and React with TypeScript for a responsive interface. SQLite provides local persistence for the data that must survive a restart.",
        details: [
          "Developed the main desktop shell, conversation surfaces and navigation between chat, models, projects and supporting tools.",
          "Connected UI state to native services responsible for launching and supervising local inference processes.",
          "Designed the data layout around app-managed storage so portable installations can retain conversations and working assets together.",
        ],
        result:
          "A desktop application architecture that can evolve independently on the interface and native-runtime sides while retaining an offline-capable core.",
      },
      {
        step: "03",
        title: "Turning local models into a usable service",
        status: "Implemented, under continual refinement",
        lead:
          "Running an open-weight model is a systems problem as well as an AI problem. Model formats, CPU and GPU differences, available memory and binary compatibility directly affect whether the assistant can start and remain responsive.",
        details: [
          "Integrated a llama.cpp-based inference path with local model discovery, activation and execution lifecycle management.",
          "Designed download, verification, cancellation, status and runtime inventory flows so installation is a supported user journey.",
          "Worked on hardware-aware launch planning, health checks and graceful fallback instead of assuming that every machine has the same accelerator.",
        ],
        result:
          "A model-management workflow that addresses the operational work around local inference, with compatibility and runtime reliability remaining active engineering priorities.",
      },
      {
        step: "04",
        title: "Expanding from chat to project work",
        status: "Implemented with explicit access boundaries",
        lead:
          "The next challenge was making AI useful in an actual workspace. A code or research task often spans several files, conversations and tool calls; handling it responsibly requires more than a longer prompt.",
        details: [
          "Introduced Projects as durable workspaces with their own instructions, linked conversations, reference files and local folders.",
          "Developed file-aware assistance that can inspect and modify scoped content while distinguishing read access from operations needing greater permission.",
          "Established bounded terminal execution and approval-oriented workflows for higher-impact actions, alongside task-level error handling and validation.",
        ],
        result:
          "A direction toward practical AI-assisted work on local projects, with clearer boundaries around the host filesystem and execution environment.",
      },
      {
        step: "05",
        title: "Connecting research, media and external services",
        status: "Evolving capabilities",
        lead:
          "Not every task is offline. Current web evidence, third-party files and other integrations require deliberate network access, and that information should not be confused with model knowledge or trusted instructions.",
        details: [
          "Extended the desktop experience with optional web search and research flows that bring retrieved evidence into the model context.",
          "Developed attachment and multimodal entry points for tasks involving documents, images and other supported content.",
          "Designed connected-app integration around explicit authorization and a local model/runtime foundation, rather than making external accounts mandatory for ordinary chat.",
        ],
        result:
          "A broader workspace that can incorporate online context when needed while keeping the locally executed assistant as its center.",
      },
      {
        step: "06",
        title: "Engineering for maintenance and real-world use",
        status: "Ongoing release engineering",
        lead:
          "A local application depends on the operating system, native binaries and user hardware. Shipping it requires careful control of installation, updates, recovery paths and regressions between platforms.",
        details: [
          "Maintained platform-specific release packages and the associated update and verification workflows.",
          "Focused follow-up work on context sizing, GPU offload visibility, startup behavior, runtime recovery and the responsiveness of longer tasks.",
          "Continued to distinguish implemented behavior from unresolved environment-specific issues; release confidence comes from validation, not from a feature checklist.",
        ],
        result:
          "An evolving product with a formal release and maintenance process, and a defined set of reliability concerns guiding the next engineering iterations.",
      },
    ],
    decisions: [
      {
        title: "Local inference instead of a mandatory hosted API",
        situation:
          "A cloud-only dependency would undercut the goal of private, portable use and introduces recurring access, latency and connectivity constraints.",
        approach:
          "Keep the core inference path on the user's machine with downloaded compatible models and native runtime management; introduce network-backed capabilities only where the task requires them.",
        tradeoff:
          "The application must handle model size, device capabilities, native binaries and slower hardware rather than delegating those concerns to a remote provider.",
      },
      {
        title: "Tauri + Rust with a React interface",
        situation:
          "The product needs native filesystem/process coordination without making every feature a low-level desktop UI implementation.",
        approach:
          "Use Rust and Tauri for privileged desktop services, with typed frontend components for fast interface iteration and clear user feedback.",
        tradeoff:
          "A cross-language boundary requires disciplined error propagation, lifecycle handling and platform-level packaging tests.",
      },
      {
        title: "Explicit permission scopes for project work",
        situation:
          "An assistant that reads or edits user projects can be helpful, but unrestricted execution is neither safe nor predictable.",
        approach:
          "Bind work to a selected workspace, separate ordinary chat from broader filesystem and terminal authority, and require deliberate approval for higher-impact actions.",
        tradeoff:
          "Permission prompts and validation add friction, but make the product's capabilities more transparent and controllable.",
      },
    ],
    delivered: [
      "A Tauri/Rust desktop product with React/TypeScript UI and SQLite-backed local data",
      "Local model and runtime lifecycle workflows built around llama.cpp",
      "Conversation and Project organization with file-aware working contexts",
      "Release tooling and platform-focused maintenance practices",
    ],
    ongoing: [
      "Model/runtime compatibility and recovery across different computers",
      "Performance tuning for long conversations, GPU availability and complex tasks",
      "Further validation of connected workflows and multimodal capabilities",
    ],
    stack: ["Tauri 2", "Rust", "React", "TypeScript", "Vite", "SQLite", "llama.cpp"],
    outcome:
      "OpenMindAI is an actively developed local AI workstation. Its central engineering contribution is the integration of model execution, persistent data and usable desktop workflows under direct user control. The development journey continues through runtime reliability, performance and release validation.",
  },
  {
    slug: "openmind-studio",
    name: "OpenMind Studio",
    eyebrow: "Desktop development tools · Portable IDE",
    tagline: "Code anywhere.",
    summary:
      "A portable desktop development environment combining code editing, terminals, language tools, runtime management and a growing set of collaborative workflows.",
    website: "https://studio.openmindai.org",
    repository: "https://github.com/smshagor-dev/OpenMind-Studio",
    image: "/uploads/founder/openmind-studio-desktop.webp",
    imageWidth: 640,
    imageHeight: 345,
    imageAlt: "Founder-provided concept visualization of the OpenMind Studio editor, terminal and proposed AI assistant layout",
    imageNote: "Founder-provided product concept visualization. It is not a verified screenshot of a shipped AI coding agent.",
    role: ["Founder & CEO", "Lead Software Engineer"],
    focus: ["Portable tooling", "Desktop IDE", "Runtime management", "Collaboration preview"],
    overview:
      "OpenMind Studio was conceived for a recurring problem in classrooms and shared work environments: a developer may need to work on a project without being able to install system-wide toolchains or keep the same machine between sessions. The aim is to combine an approachable code editor with portable tools and a predictable workspace.",
    context: [
      "The product began as a developer-experience problem, not an attempt to reproduce an editor pixel for pixel. The important questions were how files, language servers, terminal sessions and compilers would be discovered; where runtimes would live; and whether work could continue on a restricted or temporary computer.",
      "That direction led to a desktop IDE architecture with local tooling and explicit per-machine state. Collaboration and AI coding assistance were explored as complementary layers, but are presented separately from the capabilities in already published release packages.",
    ],
    responsibilities: [
      "Product concept, workflow design and technical direction",
      "Desktop editor, terminal and local runtime integration",
      "Release packaging, portability decisions and platform compatibility",
      "Collaborative editing investigation and AI-assistance roadmap",
    ],
    principles: [
      {
        title: "Portability as a system property",
        description: "Keep the editor and supported tooling usable without assuming administrator privileges or permanent changes to a shared computer.",
      },
      {
        title: "One coherent workspace",
        description: "Bring navigation, editing, terminals, language tooling and runtime management into a consistent everyday workflow.",
      },
      {
        title: "Be precise about release maturity",
        description: "Separate published desktop features, collaboration preview work and proposed AI agent capabilities so users know what to expect.",
      },
    ],
    journeyIntro:
      "The progression below reflects product and engineering work across the portable IDE, tooling, releases and collaboration experiments. Shipped and preview-only capabilities are intentionally distinguished.",
    journey: [
      {
        step: "01",
        title: "Starting from constrained development environments",
        status: "Problem and requirements",
        lead:
          "I focused on the needs of developers who switch between personal and institutional PCs. Traditional setup flows can be time-consuming or unavailable when administration rights, internet access or machine persistence are limited.",
        details: [
          "Defined a portable development workflow centered on user-space files, predictable storage paths and tool availability.",
          "Mapped the full editing session: opening a folder, understanding a project tree, editing files, running code and inspecting errors.",
          "Made per-computer isolation an explicit consideration so shared directories would not silently mix machine-specific settings and caches.",
        ],
        result:
          "A concrete set of requirements for an IDE designed around mobility and shared-computer constraints.",
      },
      {
        step: "02",
        title: "Establishing the editor and native desktop shell",
        status: "Published product foundation",
        lead:
          "The first major implementation step was integrating a familiar editing surface with native desktop services so developers could move between project files, editor tabs and terminal output without leaving the application.",
        details: [
          "Developed the Monaco-based editing workflow with project exploration, tab management and keyboard-oriented navigation.",
          "Integrated terminal and task surfaces for direct development feedback and everyday code execution.",
          "Built a Windows/Linux packaging workflow that also accounts for portable distributions and differences in the host environment.",
        ],
        result:
          "A coherent desktop editing environment, with a published release line and a familiar day-to-day workflow.",
      },
      {
        step: "03",
        title: "Making language tools and runtimes manageable",
        status: "Implemented tooling; continued compatibility work",
        lead:
          "A portable editor is only useful when developers can actually run their code. Runtime discovery, command execution and language-specific tooling vary significantly across operating systems and language ecosystems.",
        details: [
          "Developed a Runtime Manager model for handling supported toolchains inside app-managed directories.",
          "Expanded workflows across interpreted and compiled languages, including common web stacks and languages used in academic programming.",
          "Investigated environment differences such as Node.js versus npm command resolution, native compiler paths and permission-sensitive tool execution.",
        ],
        result:
          "A broader coding workflow that reduces reliance on separately configured system-wide installations, while still requiring compatibility testing on each host environment.",
      },
      {
        step: "04",
        title: "Improving reliability on shared computers",
        status: "Published improvements and ongoing hardening",
        lead:
          "Once the editor runs across different machines, its weakest points often move from the UI to the surrounding operating environment: paths, shared storage, network installations, version upgrades and resource contention.",
        details: [
          "Worked on per-machine data separation and portable cache strategies for mapped drives and shared workspaces.",
          "Improved runtime coordination, installer upgrade behavior and platform-appropriate packaging decisions.",
          "Used release reports and regression checks to distinguish packaged behavior from features still awaiting physical multi-PC verification.",
        ],
        result:
          "More deliberate portability and maintenance engineering, rather than relying solely on the editor's visual familiarity.",
      },
      {
        step: "05",
        title: "Exploring connected and collaborative workspaces",
        status: "Preview; broader field validation pending",
        lead:
          "Collaboration introduced a different set of technical requirements. Real-time changes have to remain coherent across editors while room membership, connectivity and individual machine state stay understandable to participants.",
        details: [
          "Explored peer-to-peer session establishment and collaborative editing mechanisms with workspace presence and room-level coordination.",
          "Investigated networking paths including LAN discovery and relayed connectivity for cases where direct peers cannot connect.",
          "Kept the collaboration experience framed as a preview while more real-computer and network-condition validation remains necessary.",
        ],
        result:
          "A collaboration foundation for further evaluation, without presenting preview behavior as already production-proven at classroom scale.",
      },
      {
        step: "06",
        title: "Developing the AI assistance direction",
        status: "Planned / in development; not confirmed shipped",
        lead:
          "The long-term direction is to connect an AI assistant to the current editor context without sacrificing the clarity of a conventional coding workflow. That requires careful treatment of file access, model availability, user intent and reviewable edits.",
        details: [
          "Designed assistant interactions around explain, ask, fix and code-oriented workflows inside the editor.",
          "Explored how local inference, project context and permission checks could support more capable assistance without silent workspace changes.",
          "Separated the future autonomous coding-agent experience from the configurable AI integration already described in the product's public development architecture.",
        ],
        result:
          "A defined integration direction for AI-assisted development; autonomous multi-file agent capability is not claimed as part of the published v1.0.3 release.",
      },
    ],
    decisions: [
      {
        title: "App-managed tools instead of system-wide assumptions",
        situation:
          "Shared, managed or temporary computers may block global installers and permanently configured PATH changes.",
        approach:
          "Design the runtime workflow around portable, app-managed directories and explicit execution paths, with clear reporting when a tool is unavailable.",
        tradeoff:
          "Portable binaries differ by platform and architecture; reliable detection, storage planning and testing are required.",
      },
      {
        title: "Desktop integration without recreating every editor primitive",
        situation:
          "Implementing an entire code editor engine would distract from the important workflow challenges of toolchains and portable execution.",
        approach:
          "Use Monaco as the editing surface and build the desktop shell, explorer, runtime layer and terminal workflows around it.",
        tradeoff:
          "Integration quality depends on state synchronization, keybinding behavior, editor lifecycle and platform-specific UI validation.",
      },
      {
        title: "Collaboration as an independently tested layer",
        situation:
          "Real-time editing must tolerate disconnects, multiple machines and partial network reachability, which cannot be established by a single-device demonstration.",
        approach:
          "Develop presence, sessions, room management and document synchronization as distinct pieces that can be validated together in staged tests.",
        tradeoff:
          "Preview functionality should remain clearly labeled until physical multi-PC tests and difficult network scenarios are covered.",
      },
    ],
    delivered: [
      "Portable Windows/Linux code editor distribution with Monaco-based editing",
      "Project navigation, terminal workflows and app-managed language tooling",
      "Release documentation and packaging for different deployment environments",
      "Collaboration preview groundwork with real-time editing and presence",
    ],
    ongoing: [
      "Field verification across multiple restricted/shared PCs and network setups",
      "Further editor, runtime and terminal reliability improvements",
      "AI coding agent implementation and validation before any shipped-feature claim",
    ],
    stack: ["Tauri", "Rust", "React", "TypeScript", "Monaco", "SQLite", "WebRTC"],
    outcome:
      "OpenMind Studio is a portable developer-tooling product with published Windows/Linux packages and a clearly separated roadmap for collaboration and AI assistance. Its engineering focus is reducing setup friction while preserving the capabilities developers need during real coding sessions.",
  },
];

export function getFounderProject(slug) {
  return founderProjects.find((project) => project.slug === slug);
}
