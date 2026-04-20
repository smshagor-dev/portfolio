const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const adminUser = {
  id: 1,
  name: "Admin",
  email: "support@smshagor.com",
  passwordHash: "$2b$10$G.pFyyAmjpgGxGfREYRsAuwYeLjWR0THHZchFmTYE3x9bC6UNG066",
};

const profile = {
  id: 1,
  name: "ABU SAID",
  profile: "/profile.png",
  designation: "Software Developer",
  description:
    "My name is ABU SAID. I am a professional and enthusiastic programmer in my daily life. I am a quick learner with a self-learning attitude. I love to learn and explore new technologies and am passionate about problem-solving. I love almost all the stacks of web application development and love to make the web more open to the world. My core skill is based on JavaScript and I love to do most of the things using JavaScript. I am available for any kind of job opportunity that suits my skills and interests.",
  email: "abusaid7388@gmail.com",
  phone: "+8801608797655",
  address: "Middle Badda, Dhaka, Bangladesh - 1212",
  github: "https://github.com/said7388",
  facebook: "https://www.facebook.com/abusaid.riyaz/",
  linkedIn: "https://www.linkedin.com/in/abu-said-bd/",
  twitter: "https://twitter.com/said7388",
  stackOverflow: "https://stackoverflow.com/users/16840768/abu-said",
  leetcode: "https://leetcode.com/said3812/",
  socialLinks: [
    { icon: "facebook", link: "https://www.facebook.com/abusaid.riyaz/" },
    { icon: "github", link: "https://github.com/said7388" },
    { icon: "linkedin", link: "https://www.linkedin.com/in/abu-said-bd/" },
  ],
  devUsername: "said7388",
  resume:
    "https://drive.google.com/file/d/1eyutpKFFhJ9X-qpQGKhUNnVRkB5Wer00/view?usp=sharing",
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
  sortOrder: index + 1,
}));

const experiences = [
  {
    id: 1,
    title: "Software Engineer I",
    company: "Teton Private Ltd.",
    duration: "(Jan 2022 - Present)",
  },
  {
    id: 2,
    title: "FullStack Developer",
    company: "Fiverr (freelance)",
    duration: "(Jun 2021 - Jan 2022)",
  },
  {
    id: 3,
    title: "Self Employed",
    company: "Code and build something in everyday.",
    duration: "(Jan 2018 - Present)",
  },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

const educations = [
  {
    id: 1,
    title: "Bachelor Degree",
    duration: "2020 - Present",
    institution: "National University of Bangladesh",
  },
  {
    id: 2,
    title: "Higher Secondary Certificate",
    duration: "2018 - 2020",
    institution: "Noakhali Islamia Kamil Madrasah",
  },
  {
    id: 3,
    title: "Secondary School Certificate",
    duration: "2008 - 2018",
    institution: "Baitus Saif Islamia Madrasah",
  },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

const statsCounters = [
  { id: 1, label: "Projects Completed", highlight: "Delivered", count: "50+", icon: "projects" },
  { id: 2, label: "Happy Clients", highlight: "Trusted", count: "30+", icon: "clients" },
  { id: 3, label: "Years Experience", highlight: "Journey", count: "5+", icon: "experience" },
  { id: 4, label: "Awards & Wins", highlight: "Recognized", count: "12", icon: "awards" },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

const projects = [
  {
    id: 1,
    name: "AI Powered Financial App",
    description:
      "Me and my team built an AI-powered financial mobile application. I have developed API using Express, Typescript, OpenAI, AWS, and MongoDB. Used OTP via AWS SES, Google, and Facebook for the authentication system. Built AI assistants using OpenAI's latest model and trained using our dataset. Voice messages are converted to text using AWS Transcribe. The app fetches data from Google Sheets and generates a PDF term sheet, sent via AWS SES.",
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
  },
  {
    id: 2,
    name: "Travel Agency App",
    description:
      "I have designed and developed a full-stack web app for 2Expedition, a travel agency in Armenia. I created the UI using NextJS, Typescript, MUI, TailwindCSS, Google Maps, Sun-Editor, and React Slick. The app supports multiple languages and currencies. I developed the API using NestJS, Typescript, MySQL, TypeORM, AWS, and Nodemailer. I deployed the front-end app to AWS Amplify and the back-end app to AWS EC2.",
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
  },
  {
    id: 3,
    name: "AI Powered Real Estate",
    description:
      "My team built an AI-based real estate app using Replicate API and OpenAI. We used Express, Typescript, OpenAI, Replicate, Stripe, and Mongoose to develop the API. We utilized NextJS, Formik, TailwindCSS, and other npm libraries for the UI. We have trained multiple AI assistants using the latest GPT model and integrated Replicate API for image processing. We added role-based auth, subscription plans, Cron job scheduling, and payment integration with Stripe.",
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
  },
  {
    id: 4,
    name: "Newsroom Management",
    description:
      "My team and I developed a newspaper management dashboard application called Newsroom Management. As a front-end developer, I worked on creating the dashboard using NextJS, Material UI, Redux, Calendar, and other necessary npm libraries. We used React Redux to manage the application's state and React-hook-form and Sun Editor to handle forms.",
    tools: ["NextJS", "Material UI", "Redux", "Sun Editor", "Calendar"],
    role: "Full Stack Developer",
    code: "",
    demo: "",
  },
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

async function main() {
  await prisma.adminUser.upsert({
    where: { email: adminUser.email },
    update: {},
    create: adminUser,
  });

  const existingProfile = await prisma.profile.findUnique({
    where: { id: profile.id },
  });

  if (!existingProfile) {
    await prisma.profile.create({
      data: profile,
    });
  }

  const [statsCountersCount, skillsCount, experiencesCount, educationsCount, projectsCount] = await Promise.all([
    prisma.statsCounter.count(),
    prisma.skill.count(),
    prisma.experience.count(),
    prisma.education.count(),
    prisma.project.count(),
  ]);

  if (statsCountersCount === 0) {
    await prisma.statsCounter.createMany({ data: statsCounters });
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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
