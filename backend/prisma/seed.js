const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const canonicalUrl =
  process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || "http://localhost:3000";
const adminUser = {
  id: 1,
  name: "Admin",
  email: "support@smshagor.com",
  passwordHash: "$2b$10$G.pFyyAmjpgGxGfREYRsAuwYeLjWR0THHZchFmTYE3x9bC6UNG066",
};

const profile = {
  id: 1,
  name: "Hi there, I'm Shagor",
  profile: "/profile.png",
  designation: "Software Developer",
  description:
    "Hi, I'm Shahanur Islam Shagor. I am a Software Engineer specializing in Autonomous Systems, UAV Coordination, and Cybersecurity. With over 4 years of experience in Full-Stack Development (Laravel, Node.js, React), I bridge the gap between robust software architecture and cutting-edge hardware innovation. From decentralized drone swarms to secure V2X networks, I build technology that solves complex real-world problems.",
  email: "smshagor.ru@gmail.com",
  phone: "+79954949836",
  address: "Middle Badda, Dhaka, Bangladesh - 1212",
  github: "https://github.com/smshagor-dev",
  facebook: "https://www.facebook.com/smshagor1",
  linkedIn: "https://www.linkedin.com/in/sm-shagor",
  twitter: "https://twitter.com/shahanur_shagor",
  stackOverflow: "https://stackoverflow.com//23340584/md-shahanur-islam-shagor",
  leetcode: "https://leetcode.com/smshagor1/",
  socialLinks: [
    { icon: "facebook", link: "https://www.facebook.com/smshagor1" },
    { icon: "twitter", link: "https://twitter.com/shahanur_shagor" },
    { icon: "stack-overflow", link: "https://stackoverflow.com/users/23340584/md-shahanur-islam-shagor" },
    { icon: "github", link: "https://github.com/smshagor1" },
    { icon: "linkedin", link: "https://www.linkedin.com/in/sm-shagor" },
    { icon: "leetcode", link: "https://leetcode.com/smshagor1/" },
  ],
  devUsername: "md_shahanurislamshagor_",
  resume:
    "https://drive.google.com/file/d/1wqbNNWtwFQuoxstEUoT0fo9rR_o_WDan/view?usp=sharing",
  heroSkills: {
    title: "Core technologies I work with",
    items: [
      { name: "React", image: "" },
      { name: "NextJS", image: "" },
      { name: "Redux", image: "" },
      { name: "Express", image: "" },
      { name: "NestJS", image: "" },
      { name: "MySql", image: "" },
      { name: "MongoDB", image: "" },
      { name: "Docker", image: "" },
      { name: "AWS", image: "" },
    ],
  },
  hardWorker: true,
  quickLearner: true,
  problemSolver: true,
};

const siteSettings = {
  id: 1,
  websiteTitle: "Shahanur Islam Shagor",
  websiteDescription:
    "Portfolio website for Shahanur Islam Shagor featuring services, projects, pricing, contact details, and professional experience.",
  navTitle: "Shagor",
  navSubtitle: "Software Developer",
  seoTitle: "Shahanur Islam Shagor | Software Developer Portfolio",
  seoDescription:
    "Explore the portfolio, services, projects, pricing, and contact information of Shahanur Islam Shagor.",
  seoKeywords: "portfolio, software developer, web developer, next.js, node.js, prisma",
  seoImage: "/profile.png",
  websiteIcon: "/favicon.ico",
  heroHeaderText: "Hi there, I'm Shagor",
  heroDescription:
    "I build scalable websites, dashboards, and backend systems with a strong focus on clarity, performance, and long-term maintainability.",
  heroImage: "/profile.png",
  contactEmail: "smshagor.ru@gmail.com",
  mobileNumber: "+79954949836",
  footerText: "Developer Portfolio by Shahanur Islam Shagor",
  canonicalUrl,
  googleSiteVerification: "",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  robotsIndexingEnabled: true,
  robotsFollowEnabled: true,
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpSecure: false,
  smtpFromEmail: "",
  smtpFromName: "Portfolio Website",
  smtpReplyToEmail: "",
  smtpToEmail: "",
};

const skills = [
  "HTML",
  "CSS",
  "Javascript",
  "Typescript",
  "React",
  "Next JS",
  "Tailwind",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "Git",
  "AWS",
  "Bootstrap",
  "Docker",
  "Go",
  "Figma",
  "Firebase",
  "MaterialUI",
  "Nginx",
  "Strapi",
].map((name, index) => ({
  id: index + 1,
  name,
  image: "",
  percentage: 80,
  sortOrder: index + 1,
}));

const experiences = [
  {
    id: 1,
    title: "Web Developer (Remote)",
    company: "Explo-IT.",
    location: "Dhaka, Bangladesh",
    duration: "2023 - 2025",
    description:
      "<p>Worked across product delivery, backend features, and frontend improvements while collaborating closely with stakeholders and engineering teammates.</p>",
  },
  {
    id: 2,
    title: "Web Developer (Onsite)",
    company: "DataSoft LTD.",
    location: "Dhaka, Bangladesh",
    duration: "2021 - 2022",
    description:
      "<p>Delivered freelance web projects end to end, including API work, UI implementation, deployment support, and client communication.</p>",
  },
  {
    id: 3,
    title: "Internship in Python",
    company: "Global IT.",
    location: "Dhaka, Bangladesh",
    duration: "2020-2020",
    description:
      "<p>Built personal products and experiments to sharpen engineering judgment, explore new stacks, and stay consistent with hands-on practice.</p>",
  },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

const educations = [
  {
    id: 1,
    title: "Bachelor of Science",
    duration: "2023 - Present",
    institution: "Voronezh State University of Foriestry and Technology, Russia",
    department: "Software Engineering",
    achievement:
      "<ul><li>Focused on programming fundamentals, software architecture, and system design.</li><li>Worked on academic and self-driven projects while building stronger problem-solving habits.</li></ul>",
  },
  {
    id: 2,
    title: "Diploma In Engineering",
    duration: "2018 - 2020",
    institution: "Dhaka Politechnic Institute, Bangladesh",
    department: "Computer Technology",
    achievement:
      "<ul><li>Built a solid practical foundation in hardware, networking, and software development.</li><li>Completed technical coursework with hands-on lab and project experience.</li></ul>",
  },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

const statsCounters = [
  { id: 1, label: "Projects Completed", highlight: "Delivered", count: "50+", icon: "projects" },
  { id: 2, label: "Happy Clients", highlight: "Trusted", count: "30+", icon: "clients" },
  { id: 3, label: "Years Experience", highlight: "Journey", count: "5+", icon: "experience" },
  { id: 4, label: "Awards & Wins", highlight: "Recognized", count: "12", icon: "awards" },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

const achievements = [
  {
    id: 1,
    title: "Top Performer Recognition",
    issuer: "Explo-IT",
    date: "2025",
    type: "Award",
    image: "/profile.png",
  },
  {
    id: 2,
    title: "Full-Stack Development Certificate",
    issuer: "Programming Hero",
    date: "2023",
    type: "Certificate",
    image: "/profile.png",
  },
  {
    id: 3,
    title: "Hackathon Finalist",
    issuer: "University Innovation Fest",
    date: "2022",
    type: "Competition",
    image: "/profile.png",
  },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

const serviceSection = {
  id: 1,
  title: "Services crafted for ambitious brands and product teams",
  subtitle:
    "From product strategy to polished delivery, I help businesses launch scalable digital experiences with strong engineering discipline, thoughtful UX, and maintainable backend systems.",
};

const services = [
  {
    id: 1,
    slug: "full-stack-product-development",
    name: "Full-Stack Product Development",
    impression: "Fast, scalable delivery for modern digital products.",
    impressionCount: 418,
    description:
      "End-to-end web application delivery with fast interfaces, robust APIs, and production-ready architecture.",
    content:
      "<h2>What this includes</h2><p>I design and build complete web platforms with a strong focus on maintainability, performance, and long-term product growth. That means clear frontend systems, scalable backend logic, and databases structured for real-world change.</p><ul><li>Next.js and React frontend development</li><li>Express or Node.js backend APIs</li><li>Database design with Prisma and MySQL</li><li>Admin dashboard workflows and content tools</li></ul><p>The goal is simple: deliver something your team can actually grow with.</p>",
    isFeatured: true,
    icon: "code",
    status: true,
    views: 124,
    comments: [
      {
        photo: "/profile.png",
        comment:
          "Strong engineering structure and clear communication from start to finish. The delivery felt organized and dependable.",
        impression: "Product founder",
        replies: [
          {
            reply:
              "Thanks. I always try to keep product thinking and execution aligned so teams can move quickly without losing clarity.",
            impression: "Service reply",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    slug: "backend-systems-and-api-engineering",
    name: "Backend Systems and API Engineering",
    impression: "Reliable API architecture built for long-term growth.",
    impressionCount: 267,
    description:
      "Secure, scalable backend services for dashboards, mobile apps, internal tools, and automation-heavy platforms.",
    content:
      "<h2>Reliable backend foundations</h2><p>I build backend systems that keep products stable as they grow. That includes authentication, admin access control, structured content APIs, integrations, and clear data modeling.</p><p>Whether the product is client-facing or internal, the backend is designed to stay understandable and easy to extend.</p>",
    isFeatured: false,
    icon: "database",
    status: true,
    views: 88,
    comments: [
      {
        photo: "/profile.png",
        comment:
          "The API structure was easy for our frontend team to work with, and the admin content flow saved us a lot of manual effort.",
        impression: "Frontend collaborator",
        replies: [
          {
            reply:
              "That was the goal. Clean contracts between frontend and backend make iteration much easier for the whole team.",
            impression: "Service reply",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    slug: "performance-deployment-and-support",
    name: "Performance, Deployment, and Support",
    impression: "Launch support that stays useful after day one.",
    impressionCount: 193,
    description:
      "Launch support, hosting setup, production hardening, and ongoing improvements after deployment.",
    content:
      "<h2>After launch matters too</h2><p>Shipping is only one phase of the work. I also help with deployment strategy, server setup, production checks, bug fixing, and iterative improvements so the product performs well under real usage.</p><p>This is especially valuable for teams that want technical continuity after the first release.</p>",
    isFeatured: false,
    icon: "rocket",
    status: true,
    views: 57,
    comments: [
      {
        photo: "/profile.png",
        comment:
          "Post-launch support was practical and calm. Issues were fixed quickly and the deployment process became much smoother.",
        impression: "Operations partner",
        replies: [
          {
            reply:
              "Appreciate that. Stable launches usually come from small, thoughtful improvements before and after release.",
            impression: "Service reply",
          },
        ],
      },
    ],
  },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

const projects = [
  {
    id: 1,
    slug: "ai-powered-financial-app",
    name: "AI Powered Financial App",
    description:
      "Me and my team built an AI-powered financial mobile application. I have developed API using Express, Typescript, OpenAI, AWS, and MongoDB. Used OTP via AWS SES, Google, and Facebook for the authentication system. Built AI assistants using OpenAI's latest model and trained using our dataset. Voice messages are converted to text using AWS Transcribe. The app fetches data from Google Sheets and generates a PDF term sheet, sent via AWS SES.",
    content:
      "<h2>AI workflows for finance</h2><p>This project focused on building a production-ready financial experience with AI-powered assistance, secure onboarding, and document generation. The backend connected structured business logic with third-party services in a way that stayed maintainable as the product evolved.</p><ul><li>Express and TypeScript API architecture</li><li>OpenAI-powered assistant flows</li><li>AWS SES and AWS Transcribe integrations</li><li>Automated PDF term-sheet generation</li></ul>",
    tools: [
      "Express",
      "MongoDB",
      "OpenAI API",
      "AWS SES",
      "AWS S3",
      "Node Mailer",
      "Joi",
      "Puppeteer",
      "EC2",
      "PM2",
      "Nginx",
    ],
    role: "Backend Developer",
    code: "",
    demo: "",
    image: "",
    views: 0,
    impressionCount: 0,
    buttons: [],
  },
  {
    id: 2,
    slug: "travel-agency-app",
    name: "Travel Agency App",
    description:
      "I have designed and developed a full-stack web app for 2Expedition, a travel agency in Armenia. I created the UI using NextJS, Typescript, MUI, TailwindCSS, Google Maps, Sun-Editor, and React Slick. The app supports multiple languages and currencies. I developed the API using NestJS, Typescript, MySQL, TypeORM, AWS, and Nodemailer. I deployed the front-end app to AWS Amplify and the back-end app to AWS EC2.",
    content:
      "<h2>Travel booking and content operations</h2><p>The product combined a polished customer-facing experience with the operational features a travel business needs to manage destinations, pricing, and content updates. The build covered frontend UX, backend APIs, and cloud deployment.</p><ul><li>Responsive Next.js frontend</li><li>NestJS and MySQL backend services</li><li>Multi-language and multi-currency support</li><li>AWS deployment for both frontend and backend</li></ul>",
    tools: [
      "NextJS",
      "Tailwind CSS",
      "Google Maps",
      "NestJS",
      "TypeScript",
      "MySQL",
      "AWS S3",
      "Sun-Editor",
      "Gmail Passkey",
    ],
    role: "Full Stack Developer",
    code: "",
    demo: "",
    image: "",
    views: 0,
    impressionCount: 0,
    buttons: [],
  },
  {
    id: 3,
    slug: "ai-powered-real-estate",
    name: "AI Powered Real Estate",
    description:
      "My team built an AI-based real estate app using Replicate API and OpenAI. We used Express, Typescript, OpenAI, Replicate, Stripe, and Mongoose to develop the API. We utilized NextJS, Formik, TailwindCSS, and other npm libraries for the UI. We have trained multiple AI assistants using the latest GPT model and integrated Replicate API for image processing. We added role-based auth, subscription plans, Cron job scheduling, and payment integration with Stripe.",
    content:
      "<h2>AI-assisted property workflows</h2><p>This platform blended listing management, subscriptions, payments, and AI image processing into one product experience. The goal was to make the product commercially useful while keeping the architecture stable for future expansion.</p><ul><li>Role-based authentication and subscriptions</li><li>Stripe billing integration</li><li>OpenAI and Replicate workflows</li><li>Frontend and backend delivery across one stack</li></ul>",
    tools: [
      "React",
      "Bootstrap",
      "SCSS",
      "Stripe",
      "Express",
      "TypeScript",
      "MongoDB",
      "Azure Blob",
      "OpenAI API",
      "Replicate AI",
      "Cronjob",
      "JWT",
    ],
    role: "Full Stack Developer",
    code: "",
    demo: "",
    image: "",
    views: 0,
    impressionCount: 0,
    buttons: [],
  },
  {
    id: 4,
    slug: "newsroom-management",
    name: "Newsroom Management",
    description:
      "My team and I developed a newspaper management dashboard application called Newsroom Management. As a front-end developer, I worked on creating the dashboard using NextJS, Material UI, Redux, Calendar, and other necessary npm libraries. We used React Redux to manage the application's state and React-hook-form and Sun Editor to handle forms.",
    content:
      "<h2>Editorial dashboard tooling</h2><p>This project focused on helping newsroom teams manage publishing workflows through a structured dashboard interface. I worked on creating a frontend that felt organized under heavy feature density while remaining efficient for editors.</p><ul><li>Dashboard UI with Next.js and Material UI</li><li>Redux state management</li><li>Form workflows with React Hook Form</li><li>Calendar and editorial planning features</li></ul>",
    tools: ["NextJS", "Material UI", "Redux", "Sun Editor", "Calendar"],
    role: "Full Stack Developer",
    code: "",
    demo: "",
    image: "",
    views: 0,
    impressionCount: 0,
    buttons: [],
  },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

const pricings = [
  {
    id: 1,
    slug: "starter",
    name: "Starter",
    description: "A simple plan for small websites, landing pages, and quick launch support.",
    price: 49.0,
    duration: "Monthly",
    content:
      "<h2>Great for getting online quickly</h2><p>This package works well for founders, personal brands, and small businesses that need a polished web presence without a long delivery cycle. It focuses on clarity, speed, and a clean launch path.</p><ul><li>Focused scope for faster delivery</li><li>Responsive layout across devices</li><li>Direct communication during the build</li><li>Clean handoff and launch guidance</li></ul>",
    features: ["1 landing page", "Basic support", "Design updates", "Email support"],
    status: true,
    isPopular: false,
  },
  {
    id: 2,
    slug: "professional",
    name: "Professional",
    description: "Best for growing products that need design, development, and ongoing iteration.",
    price: 149.0,
    duration: "Monthly",
    content:
      "<h2>Designed for teams that need more depth</h2><p>The professional plan is a stronger engagement for businesses that need multiple pages, refined UX, admin workflows, and a more structured product setup. It balances speed with scalability.</p><ul><li>Multi-page product or business site</li><li>Admin-friendly architecture</li><li>Performance and quality improvements</li><li>Priority communication and iteration</li></ul>",
    features: ["Up to 5 pages", "Priority support", "Performance tweaks", "Admin dashboard"],
    status: true,
    isPopular: true,
  },
  {
    id: 3,
    slug: "enterprise",
    name: "Enterprise",
    description: "A deeper engagement for complex product builds, backend systems, and long-term delivery.",
    price: 999.0,
    duration: "Annual",
    content:
      "<h2>For advanced systems and long-term delivery</h2><p>This is the right fit when the work goes beyond a marketing site and into dashboards, backend systems, integrations, or ongoing product support. It is shaped around scale, complexity, and technical continuity.</p><ul><li>Custom roadmap and solution design</li><li>Backend architecture and integrations</li><li>Deployment and support planning</li><li>Flexible collaboration for larger scope</li></ul>",
    features: ["Custom scope", "Dedicated support", "Backend architecture", "Deployment guidance"],
    status: true,
    isPopular: false,
  },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    content:
      "<p>Working together felt organized from day one. Communication stayed clear, delivery was fast, and the final result matched the business goals perfectly.</p>",
    image: "/image/review.png",
    company: "Northwind Studio",
    position: "Marketing Director",
    stars: 5,
    status: true,
  },
  {
    id: 2,
    name: "Daniel Carter",
    content:
      "<p>The project moved smoothly from planning to launch. Strong execution, thoughtful problem-solving, and a polished end product made a real difference for our team.</p>",
    image: "/image/review.png",
    company: "BrightPath Labs",
    position: "Product Lead",
    stars: 5,
    status: true,
  },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

async function main() {
  await prisma.adminUser.upsert({
    where: { email: adminUser.email },
    update: {},
    create: adminUser,
  });

  await prisma.siteSettings.upsert({
    where: { id: siteSettings.id },
    update: {},
    create: siteSettings,
  });

  const existingProfile = await prisma.profile.findUnique({
    where: { id: profile.id },
  });

  if (!existingProfile) {
    await prisma.profile.create({
      data: profile,
    });
  }

  const [
    serviceSectionCount,
    servicesCount,
    statsCountersCount,
    achievementsCount,
    skillsCount,
    experiencesCount,
    educationsCount,
    projectsCount,
    pricingsCount,
    testimonialsCount,
  ] = await Promise.all([
    prisma.serviceSection.count(),
    prisma.service.count(),
    prisma.statsCounter.count(),
    prisma.achievement.count(),
    prisma.skill.count(),
    prisma.experience.count(),
    prisma.education.count(),
    prisma.project.count(),
    prisma.pricing.count(),
    prisma.testimonial.count(),
  ]);

  if (serviceSectionCount === 0) {
    await prisma.serviceSection.create({
      data: serviceSection,
    });
  }

  if (servicesCount === 0) {
    for (const service of services) {
      await prisma.service.create({
        data: {
          id: service.id,
          slug: service.slug,
          name: service.name,
          impression: service.impression,
          impressionCount: service.impressionCount || 0,
          description: service.description,
          content: service.content,
          isFeatured: service.isFeatured,
          icon: service.icon,
          status: service.status,
          views: service.views,
          sortOrder: service.sortOrder,
          comments: {
            create: (service.comments || []).map((comment, commentIndex) => ({
              photo: comment.photo,
              comment: comment.comment,
              impression: comment.impression,
              sortOrder: commentIndex + 1,
              replies: {
                create: (comment.replies || []).map((reply, replyIndex) => ({
                  reply: reply.reply,
                  impression: reply.impression,
                  sortOrder: replyIndex + 1,
                })),
              },
            })),
          },
        },
      });
    }
  }

  if (statsCountersCount === 0) {
    await prisma.statsCounter.createMany({ data: statsCounters });
  }

  if (achievementsCount === 0) {
    await prisma.achievement.createMany({ data: achievements });
  }

  if (skillsCount === 0) {
    await prisma.skill.createMany({ data: skills });
  }

  if (experiencesCount === 0) {
    await prisma.experience.createMany({ data: experiences });
  }

  if (educationsCount === 0) {
    await prisma.education.createMany({ data: educations });
  }

  if (projectsCount === 0) {
    await prisma.project.createMany({ data: projects });
  }

  if (pricingsCount === 0) {
    await prisma.pricing.createMany({ data: pricings });
  }

  if (testimonialsCount === 0) {
    await prisma.testimonial.createMany({ data: testimonials });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
