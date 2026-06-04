function normalizeString(value) {
  return String(value || "").trim();
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item)).filter(Boolean);
  }

  return [];
}

function compactLines(lines) {
  return lines.map((line) => normalizeString(line)).filter(Boolean).join("\n");
}

function safeJson(value) {
  return JSON.stringify(value || {}, null, 2);
}

function getCvUrl(profileContext) {
  return normalizeString(profileContext?.optionalCvProfile?.resumeUrl) || normalizeString(profileContext?.profile?.resume);
}

function topProjects(profileContext, limit = 3) {
  return normalizeArray(profileContext?.projects)
    .slice(0, limit)
    .map((project) => ({
      name: project.name,
      description: project.description,
      role: project.role,
      tools: project.tools,
      demo: project.demo,
      code: project.code,
    }));
}

function buildSystemPrompt() {
  return compactLines([
    "You are a safe job application writing agent working for Md Shahanur Islam Shagor.",
    "Write as if Md Shahanur Islam Shagor personally wrote the message: natural, honest, concise, confident, and recruiter-friendly.",
    "Use only the provided portfolio profile, skills, education, projects, experience, CV URL, recruiter context, match context, and job details.",
    "Do not invent employers, degrees, achievements, certifications, skills, project results, job requirements, or recruiter details.",
    "Do not use fake experience. Do not overclaim. Do not mention missing skills negatively.",
    "Avoid generic AI phrases such as 'I am excited to leverage', 'dynamic professional', 'synergy', and 'passionate individual'.",
    "Keep paragraphs short and easy to scan.",
    "Never include API keys, OAuth tokens, SMTP passwords, encrypted secrets, or internal server paths.",
  ]);
}

function buildContextBlock({ profileContext, job, match, recruiter, settings }) {
  return safeJson({
    applicant: {
      name: profileContext?.profile?.name || "Md Shahanur Islam Shagor",
      designation: profileContext?.profile?.designation,
      summary: profileContext?.summary,
      email: profileContext?.profile?.email,
      portfolio: profileContext?.profile?.devUsername || profileContext?.profile?.github || profileContext?.profile?.linkedIn,
      cvUrl: getCvUrl(profileContext),
      skills: normalizeArray(profileContext?.skills),
      education: normalizeArray(profileContext?.education),
      experience: normalizeArray(profileContext?.experience),
      strongestProjects: topProjects(profileContext),
      optionalNotes: profileContext?.optionalCvProfile?.extraNotes,
      sourceTablesUsed: profileContext?.sourceTablesUsed,
    },
    job: {
      title: job?.title,
      company: job?.company,
      location: job?.location,
      description: job?.description,
      sourceUrl: job?.sourceUrl,
    },
    recruiter: recruiter
      ? {
          name: recruiter.name,
          email: recruiter.email,
          company: recruiter.company || job?.company,
          verified: Boolean(recruiter.verified),
          source: recruiter.source,
        }
      : null,
    match: match
      ? {
          score: match.score,
          matchedSkills: normalizeArray(match.matchedSkills),
          missingSkills: normalizeArray(match.missingSkills),
          summary: match.summary,
        }
      : null,
    settings: {
      tone: settings?.tone || "professional-natural",
      maxEmailWords: settings?.maxEmailWords || 160,
      maxCoverLetterWords: settings?.maxCoverLetterWords || 450,
      attachCv: settings?.attachCv !== false,
      attachCoverLetterPdf: settings?.attachCoverLetterPdf !== false,
    },
  });
}

function buildRecruiterEmailPrompt({ profileContext, job, match, recruiter, settings }) {
  const maxEmailWords = settings?.maxEmailWords || 160;
  const emailWordRule = maxEmailWords < 140
    ? `Email body should be 90-${maxEmailWords} words.`
    : `Email body should be 90-140 words and never exceed ${maxEmailWords} words.`;

  return compactLines([
    "Task: Create a recruiter outreach email.",
    "Return strict JSON only: {\"emailSubject\":\"...\",\"emailBody\":\"...\"}.",
    "Generate a clear subject and body.",
    "Subject format: Application for {jobTitle} - Md Shahanur Islam Shagor.",
    emailWordRule,
    "Use a simple greeting. If recruiter name exists, use it; otherwise use 'Hello'.",
    "The first sentence must be direct and specific to the role and company.",
    "Connect only the strongest 1-2 relevant skills or projects from the portfolio context to the job.",
    "Add one sentence explaining why the role fits the applicant.",
    "If attachments are enabled, include this exact sentence: I've attached my CV and cover letter for your review.",
    "Include portfolio link only if available in the context.",
    "Sound confident, polite, and human.",
    "No emojis.",
    "No markdown.",
    "No bullet points.",
    "Do not mention missing skills, weak fit, uncertainty, or anything negative.",
    "Avoid these generic phrases: I am writing to express my interest; I am excited to leverage; dynamic professional; synergy; passionate individual; fast-paced environment.",
    "Context:",
    buildContextBlock({ profileContext, job, match, recruiter, settings }),
  ]);
}

function buildCoverLetterPrompt({ profileContext, job, match, settings }) {
  return compactLines([
    "Task: Write a customized cover letter for this job.",
    "Return strict JSON only: {\"coverLetterText\":\"...\"}.",
    "Generate clean cover letter text for a PDF.",
    "Use 3-4 short paragraphs only.",
    "Opening should mention the role/company and direct interest.",
    "Middle should connect the strongest real portfolio skills, projects, or experience to the job requirements.",
    "Closing should be polite and mention the attached CV if available.",
    "Keep it recruiter-friendly and ATS-friendly.",
    `Keep it under ${settings?.maxCoverLetterWords || 450} words.`,
    "Prefer natural human wording.",
    "No markdown.",
    "No fake achievements.",
    "Do not invent facts. Do not exaggerate. Do not mention missing skills negatively.",
    "Avoid generic filler and AI-style language.",
    "Context:",
    buildContextBlock({ profileContext, job, match, recruiter: null, settings }),
  ]);
}

function buildMatchPrompt({ profileContext, job, settings }) {
  return compactLines([
    "Task: Analyze how well the applicant matches this job.",
    "Return strict JSON only: {\"score\":0,\"matchedSkills\":[],\"missingSkills\":[],\"summary\":\"...\"}.",
    "Score should be 0-100 based only on provided profile and job context.",
    "Matched skills must come from the portfolio/profile context.",
    "Missing skills should be factual and concise, but do not frame them negatively.",
    "Do not invent skills or experience.",
    "Context:",
    buildContextBlock({ profileContext, job, match: null, recruiter: null, settings }),
  ]);
}

module.exports = {
  buildCoverLetterPrompt,
  buildMatchPrompt,
  buildRecruiterEmailPrompt,
  buildSystemPrompt,
};
