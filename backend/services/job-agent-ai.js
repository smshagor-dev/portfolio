const { generateAssistantResponse } = require("./ai");
const { decryptText, encryptText } = require("../utils/encryption");
const {
  buildCoverLetterPrompt,
  buildMatchPrompt,
  buildRecruiterEmailPrompt,
  buildSystemPrompt,
} = require("./job-agent-prompt-engine");

const PROVIDERS = ["DEEPSEEK", "GEMINI", "OPENAI"];

const PROVIDER_LABELS = {
  DEEPSEEK: "DeepSeek \u2014 Recommended / Cost-effective",
  GEMINI: "Gemini \u2014 Fast fallback",
  OPENAI: "OpenAI \u2014 Premium quality",
};

const AVAILABLE_MODELS = {
  DEEPSEEK: ["deepseek-chat", "deepseek-reasoner"],
  GEMINI: ["gemini-1.5-flash", "gemini-1.5-pro"],
  OPENAI: ["gpt-4o-mini", "gpt-4o"],
};

const RECOMMENDED_MODELS = {
  DEEPSEEK: "deepseek-chat",
  GEMINI: "gemini-1.5-flash",
  OPENAI: "gpt-4o-mini",
};

const DEFAULT_SYSTEM_PROMPT =
  "You are writing on behalf of Md Shahanur Islam Shagor. Write naturally, professionally, and honestly, as if Md Shahanur Islam Shagor personally wrote the message. Use only the provided portfolio profile, skills, education, projects, experience, CV link, and job details. Do not invent experience, employers, degrees, achievements, certifications, or skills. Be concise, confident, respectful, and recruiter-friendly. Avoid generic AI-sounding phrases, exaggeration, buzzwords, and robotic wording. The message should feel human, specific, and easy for a recruiter to read quickly.";

const DEFAULT_RECRUITER_EMAIL_PROMPT =
  "Create a short recruiter outreach email for the job below. The email must feel personal, natural, and written by the applicant, not by an AI. Start with a simple greeting. If recruiter name exists, use it; otherwise use 'Hello'. Mention the exact role/company if available. Connect 1-2 strongest relevant skills or projects from the provided portfolio context to the job requirements. Keep the tone professional, warm, confident, and humble. Keep it under {{maxEmailWords}} words. Include that CV and cover letter are attached if attachments are enabled. Include portfolio link only if available. Do not overpromise. Do not use fake claims. End with a polite interest in discussing the opportunity.";

const DEFAULT_COVER_LETTER_PROMPT =
  "Write a customized cover letter for this job using only the provided real portfolio context. Make it recruiter-friendly, ATS-friendly, and natural. Structure it with a clear opening, relevant skills/projects/experience, motivation for the role, and a polite closing. Avoid generic filler and AI-style language. Do not invent facts. Keep it under {{maxCoverLetterWords}} words. The letter should make the recruiter feel the applicant is relevant, honest, motivated, and worth reviewing.";

function normalizeString(value) {
  return String(value || "").trim();
}

function promptOverrideAllowed() {
  return String(process.env.JOB_AGENT_ALLOW_PROMPT_OVERRIDE || "").trim().toLowerCase() === "true";
}

function normalizeProvider(value, fallback = "DEEPSEEK") {
  const normalized = normalizeString(value || fallback).toUpperCase();
  return PROVIDERS.includes(normalized) ? normalized : fallback;
}

function getDefaultModel(provider) {
  return RECOMMENDED_MODELS[normalizeProvider(provider)] || RECOMMENDED_MODELS.DEEPSEEK;
}

function normalizeModelForProvider(provider, model) {
  const normalizedProvider = normalizeProvider(provider);
  const normalizedModel = normalizeString(model);
  return normalizedModel || getDefaultModel(normalizedProvider);
}

function providerToServiceName(provider) {
  return normalizeProvider(provider).toLowerCase();
}

function getEncryptedKeyField(provider) {
  switch (normalizeProvider(provider)) {
    case "OPENAI":
      return "openaiApiKeyEncrypted";
    case "GEMINI":
      return "geminiApiKeyEncrypted";
    case "DEEPSEEK":
    default:
      return "deepseekApiKeyEncrypted";
  }
}

function keyConfigured(settings, provider) {
  return Boolean(settings?.[getEncryptedKeyField(provider)]);
}

function serializeJobAgentAiSetting(settings) {
  const aiProvider = normalizeProvider(settings?.aiProvider);
  const allowPromptOverride = promptOverrideAllowed();
  return {
    id: settings?.id || 1,
    aiProvider,
    aiModel: normalizeModelForProvider(aiProvider, settings?.aiModel),
    deepseekKeyConfigured: Boolean(settings?.deepseekApiKeyEncrypted),
    geminiKeyConfigured: Boolean(settings?.geminiApiKeyEncrypted),
    openaiKeyConfigured: Boolean(settings?.openaiApiKeyEncrypted),
    providerLabels: PROVIDER_LABELS,
    availableModels: AVAILABLE_MODELS,
    recommendedModels: RECOMMENDED_MODELS,
    fallbackProvider: settings?.fallbackProvider ? normalizeProvider(settings.fallbackProvider) : "",
    fallbackEnabled: Boolean(settings?.fallbackEnabled),
    allowPromptOverride,
    systemPrompt: allowPromptOverride ? settings?.systemPrompt || "" : "",
    recruiterEmailPrompt: allowPromptOverride ? settings?.recruiterEmailPrompt || "" : "",
    coverLetterPrompt: allowPromptOverride ? settings?.coverLetterPrompt || "" : "",
    tone: settings?.tone || "professional-natural",
    maxEmailWords: settings?.maxEmailWords || 160,
    maxCoverLetterWords: settings?.maxCoverLetterWords || 450,
    requireAdminApproval: settings?.requireAdminApproval !== false,
    attachCv: settings?.attachCv !== false,
    attachCoverLetterPdf: settings?.attachCoverLetterPdf !== false,
    autoGenerateCoverLetter: settings?.autoGenerateCoverLetter !== false,
    createdAt: settings?.createdAt || null,
    updatedAt: settings?.updatedAt || null,
  };
}

function buildDefaultAiSettingCreate() {
  return {
    id: 1,
    aiProvider: "DEEPSEEK",
    aiModel: "deepseek-chat",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    recruiterEmailPrompt: DEFAULT_RECRUITER_EMAIL_PROMPT,
    coverLetterPrompt: DEFAULT_COVER_LETTER_PROMPT,
    tone: "professional-natural",
    maxEmailWords: 160,
    maxCoverLetterWords: 450,
    requireAdminApproval: true,
    attachCv: true,
    attachCoverLetterPdf: true,
    autoGenerateCoverLetter: true,
  };
}

async function getJobAgentAiSetting(prisma) {
  return prisma.jobAgentAiSetting.upsert({
    where: { id: 1 },
    update: {},
    create: buildDefaultAiSettingCreate(),
  });
}

function normalizeAiSettingPayload(body, existing) {
  const aiProvider = normalizeProvider(body?.aiProvider || existing?.aiProvider);
  const fallbackProvider = normalizeString(body?.fallbackProvider)
    ? normalizeProvider(body.fallbackProvider)
    : null;

  const payload = {
    aiProvider,
    aiModel: normalizeModelForProvider(aiProvider, body?.aiModel),
    fallbackProvider,
    fallbackEnabled: typeof body?.fallbackEnabled === "boolean" ? body.fallbackEnabled : Boolean(existing?.fallbackEnabled),
    tone: normalizeString(body?.tone || existing?.tone) || "professional-natural",
    maxEmailWords: Math.max(40, Number.parseInt(body?.maxEmailWords, 10) || existing?.maxEmailWords || 160),
    maxCoverLetterWords: Math.max(120, Number.parseInt(body?.maxCoverLetterWords, 10) || existing?.maxCoverLetterWords || 450),
    requireAdminApproval:
      typeof body?.requireAdminApproval === "boolean"
        ? body.requireAdminApproval
        : existing?.requireAdminApproval !== false,
    attachCv: typeof body?.attachCv === "boolean" ? body.attachCv : existing?.attachCv !== false,
    attachCoverLetterPdf:
      typeof body?.attachCoverLetterPdf === "boolean"
        ? body.attachCoverLetterPdf
        : existing?.attachCoverLetterPdf !== false,
    autoGenerateCoverLetter:
      typeof body?.autoGenerateCoverLetter === "boolean"
        ? body.autoGenerateCoverLetter
        : existing?.autoGenerateCoverLetter !== false,
  };

  if (promptOverrideAllowed()) {
    payload.systemPrompt = normalizeString(body?.systemPrompt ?? existing?.systemPrompt) || DEFAULT_SYSTEM_PROMPT;
    payload.recruiterEmailPrompt =
      normalizeString(body?.recruiterEmailPrompt ?? existing?.recruiterEmailPrompt) || DEFAULT_RECRUITER_EMAIL_PROMPT;
    payload.coverLetterPrompt =
      normalizeString(body?.coverLetterPrompt ?? existing?.coverLetterPrompt) || DEFAULT_COVER_LETTER_PROMPT;
  }

  return payload;
}

function buildEncryptedKeyUpdate(body) {
  const update = {};
  for (const provider of PROVIDERS) {
    const lower = provider.toLowerCase();
    const value = normalizeString(body?.[`${lower}ApiKey`]);
    if (value) {
      update[getEncryptedKeyField(provider)] = encryptText(value);
    }
  }
  return update;
}

function applyPromptTemplate(prompt, settings) {
  return normalizeString(prompt)
    .replaceAll("{{maxEmailWords}}", String(settings.maxEmailWords || 160))
    .replaceAll("{{maxCoverLetterWords}}", String(settings.maxCoverLetterWords || 450));
}

function getSystemPrompt(settings) {
  if (promptOverrideAllowed() && normalizeString(settings?.systemPrompt)) {
    return settings.systemPrompt;
  }

  return buildSystemPrompt();
}

function buildFinalPrompts({ settings, profileContext, job, match, recruiterContact, mode }) {
  const systemPrompt = getSystemPrompt(settings);
  const emailPrompt =
    promptOverrideAllowed() && normalizeString(settings?.recruiterEmailPrompt)
      ? applyPromptTemplate(settings.recruiterEmailPrompt, settings)
      : buildRecruiterEmailPrompt({
          profileContext,
          job,
          match,
          recruiter: recruiterContact,
          settings,
        });
  const coverLetterPrompt =
    promptOverrideAllowed() && normalizeString(settings?.coverLetterPrompt)
      ? applyPromptTemplate(settings.coverLetterPrompt, settings)
      : buildCoverLetterPrompt({
          profileContext,
          job,
          match,
          settings,
        });
  const matchPrompt = buildMatchPrompt({ profileContext, job, settings });

  return {
    systemPrompt,
    emailPrompt: mode === "email" || mode === "both" ? emailPrompt : "",
    coverLetterPrompt: mode === "coverLetter" || mode === "both" ? coverLetterPrompt : "",
    matchPrompt,
  };
}

function parseJsonFence(value) {
  return String(value || "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseAiJson(value) {
  return JSON.parse(parseJsonFence(value));
}

function topSkills(profileContext, job, limit = 4) {
  const haystack = `${job?.title || ""} ${job?.company || ""} ${job?.description || ""}`.toLowerCase();
  const skills = Array.isArray(profileContext?.skills) ? profileContext.skills : [];
  const matched = skills.filter((skill) => haystack.includes(String(skill).toLowerCase()));
  return (matched.length ? matched : skills).slice(0, limit);
}

function mockHumanEmail({ job, profileContext, settings, attachmentState, recruiterName }) {
  const greeting = recruiterName ? `Hello ${recruiterName},` : "Hello,";
  const skills = topSkills(profileContext, job, 2);
  const role = normalizeString(job?.title) || "the role";
  const company = normalizeString(job?.company) || "your team";
  const project = profileContext?.projects?.[0]?.name ? `, including work on ${profileContext.projects[0].name}` : "";
  const attachmentLine = attachmentState?.attachmentsEnabled
    ? "I have attached my CV and cover letter for your review."
    : "I would be happy to share any additional details you need.";

  return [
    greeting,
    "",
    `I am interested in the ${role} opportunity at ${company}. My background as Md Shahanur Islam Shagor aligns well with this role, especially around ${skills.join(" and ") || "modern web development"}${project}.`,
    "",
    `${attachmentLine} I would appreciate the chance to discuss how I can contribute to your team.`,
    "",
    "Best regards,",
    "Md Shahanur Islam Shagor",
  ].join("\n");
}

function mockCoverLetter({ job, profileContext }) {
  const skills = topSkills(profileContext, job, 4).join(", ") || "modern web development";
  return [
    "Md Shahanur Islam Shagor",
    "",
    `Dear Hiring Team,`,
    "",
    `I am writing to express my interest in the ${normalizeString(job?.title) || "open"} role${job?.company ? ` at ${job.company}` : ""}. My portfolio background shows practical experience across ${skills}, and I focus on building reliable, user-friendly software with clean implementation details.`,
    "",
    `The role stood out to me because it connects closely with the kind of work I enjoy: solving real problems, learning quickly, and delivering thoughtful web experiences. Based on the provided job details, I believe my skills, projects, and experience would let me contribute with honesty and care from the start.`,
    "",
    "Thank you for reviewing my application. I would welcome the opportunity to discuss how my background can support your team.",
    "",
    "Sincerely,",
    "Md Shahanur Islam Shagor",
  ].join("\n");
}

async function callProvider(settings, provider, userMessage, maxTokens, systemPrompt) {
  const keyField = getEncryptedKeyField(provider);
  const encryptedKey = settings?.[keyField];
  if (!encryptedKey) {
    throw new Error(`${provider} API key is not configured.`);
  }

  return generateAssistantResponse({
    provider: providerToServiceName(provider),
    apiKey: decryptText(encryptedKey),
    baseUrl: "",
    modelName: settings.aiModel || getDefaultModel(provider),
    systemPrompt: systemPrompt || getSystemPrompt(settings),
    userMessage,
    temperature: 0.35,
    maxTokens,
  });
}

async function generateWithFallback(settings, userMessage, maxTokens, systemPrompt) {
  const primary = normalizeProvider(settings.aiProvider);
  const attempts = [primary];
  if (settings.fallbackEnabled && settings.fallbackProvider) {
    const fallback = normalizeProvider(settings.fallbackProvider);
    if (!attempts.includes(fallback)) {
      attempts.push(fallback);
    }
  }

  const errors = [];
  for (const provider of attempts) {
    try {
      const text = await callProvider(settings, provider, userMessage, maxTokens, systemPrompt);
      return {
        text,
        provider,
        model: settings.aiModel || getDefaultModel(provider),
        mocked: false,
        errors,
      };
    } catch (error) {
      errors.push(`${provider}: ${error.message}`);
    }
  }

  throw new Error(errors.join(" | ") || "No AI provider could generate content.");
}

async function generateJobAgentContent({ settings, profileContext, job, recruiterContact, mode = "both" }) {
  const prompts = buildFinalPrompts({
    settings,
    profileContext,
    job,
    match: null,
    recruiterContact,
    mode,
  });
  const attachmentState = {
    attachCv: settings.attachCv,
    attachCoverLetterPdf: settings.attachCoverLetterPdf,
    attachmentsEnabled: Boolean(settings.attachCv || settings.attachCoverLetterPdf),
  };
  const payload = {
    instructions: {
      systemPrompt: prompts.systemPrompt,
      recruiterEmailPrompt: prompts.emailPrompt,
      coverLetterPrompt: prompts.coverLetterPrompt,
      matchPrompt: prompts.matchPrompt,
      tone: settings.tone,
      maxEmailWords: settings.maxEmailWords,
      maxCoverLetterWords: settings.maxCoverLetterWords,
      output: "Return strict JSON with emailSubject, emailBody, coverLetterText, score, matchedSkills, missingSkills, summary.",
    },
    safety: [
      "Use only provided portfolio and job context.",
      "Do not invent facts.",
      "Do not scrape or describe LinkedIn page content.",
      "Do not guess recruiter emails.",
    ],
    attachmentState,
    recruiterContact: recruiterContact
      ? {
          name: recruiterContact.name,
          emailVerified: Boolean(recruiterContact.verified),
          source: recruiterContact.source,
        }
      : null,
    profileContext,
    job,
  };

  try {
    const generated = await generateWithFallback(settings, JSON.stringify(payload), 2400, prompts.systemPrompt);
    const parsed = parseAiJson(generated.text);
    return {
      emailSubject: normalizeString(parsed.emailSubject) || `Application for ${job.title}`,
      emailBody: normalizeString(parsed.emailBody),
      coverLetterText: normalizeString(parsed.coverLetterText),
      score: Number.parseInt(parsed.score, 10),
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      summary: normalizeString(parsed.summary),
      provider: generated.provider,
      model: generated.model,
      mocked: false,
      errors: generated.errors,
      systemPromptUsed: prompts.systemPrompt,
      emailPromptUsed: prompts.emailPrompt,
      coverLetterPromptUsed: prompts.coverLetterPrompt,
      matchPromptUsed: prompts.matchPrompt,
    };
  } catch (error) {
    const emailBody = mockHumanEmail({
      job,
      profileContext,
      settings,
      attachmentState,
      recruiterName: recruiterContact?.name || "",
    });
    const coverLetterText = mockCoverLetter({ job, profileContext });
    return {
      emailSubject: `Application for ${job.title}`,
      emailBody,
      coverLetterText,
      score: 50,
      matchedSkills: topSkills(profileContext, job, 4),
      missingSkills: [],
      summary: "Mock-safe content generated because no configured AI provider succeeded.",
      provider: normalizeProvider(settings.aiProvider),
      model: settings.aiModel || getDefaultModel(settings.aiProvider),
      mocked: true,
      errors: [error.message],
      systemPromptUsed: prompts.systemPrompt,
      emailPromptUsed: prompts.emailPrompt,
      coverLetterPromptUsed: prompts.coverLetterPrompt,
      matchPromptUsed: prompts.matchPrompt,
    };
  }
}

module.exports = {
  DEFAULT_COVER_LETTER_PROMPT,
  DEFAULT_RECRUITER_EMAIL_PROMPT,
  DEFAULT_SYSTEM_PROMPT,
  buildEncryptedKeyUpdate,
  buildFinalPrompts,
  generateJobAgentContent,
  getJobAgentAiSetting,
  keyConfigured,
  normalizeAiSettingPayload,
  normalizeProvider,
  serializeJobAgentAiSetting,
};
