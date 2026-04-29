const prisma = require("../lib/prisma");
const { buildAssistantContext } = require("../lib/assistant-context");
const { decryptText } = require("../utils/encryption");
const { generateAssistantResponse } = require("./ai");

function normalizeString(value) {
  return String(value || "").trim();
}

function detectMessageLanguage(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return "english";
  }

  if (/[\u0980-\u09FF]/.test(normalized)) {
    return "bangla";
  }

  const lowered = normalized.toLowerCase();
  if (
    /\b(ami|amar|apni|tumi|ki|kemon|lagbe|dorkar|chai|asen|ase|hobe|koren|korbo|bolo|bolen|link|cv)\b/.test(lowered)
  ) {
    return "banglish";
  }

  return "english";
}

function cleanAssistantReply(value) {
  const normalized = String(value || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\r\n/g, "\n")
    .trim();

  return normalized;
}

function isGreetingMessage(value) {
  const normalized = normalizeString(value).toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  return [
    "hi",
    "hello",
    "hey",
    "assalamu alaikum",
    "as salamualaikum",
    "salam",
    "good morning",
    "good afternoon",
    "good evening",
  ].includes(normalized);
}

function normalizeAiModelName(provider, modelName) {
  const normalizedProvider = normalizeString(provider).toLowerCase();
  const normalizedModel = normalizeString(modelName);

  if (!normalizedModel) {
    return "";
  }

  if (normalizedProvider !== "deepseek") {
    return normalizedModel;
  }

  const loweredModel = normalizedModel.toLowerCase();

  if (["deepseek-v4-pro", "deepseek-v4-flash"].includes(loweredModel)) {
    return loweredModel;
  }

  if (["deepseek-v4", "deepseek", "deepseek-chat"].includes(loweredModel)) {
    return "deepseek-v4-pro";
  }

  return normalizedModel;
}

async function generatePortfolioAssistantReply(message) {
  const normalizedMessage = normalizeString(message);
  const detectedLanguage = detectMessageLanguage(normalizedMessage);

  if (!normalizedMessage) {
    return "";
  }

  if (isGreetingMessage(normalizedMessage)) {
    if (detectedLanguage === "bangla") {
      return "\u09b9\u09cd\u09af\u09be\u09b2\u09cb! \u0986\u09ae\u09be\u09b0 services, projects, skills, experience, pricing, FAQs \u09ac\u09be contact details \u09a8\u09bf\u09df\u09c7 \u099c\u09be\u09a8\u09a4\u09c7 \u099a\u09be\u0987\u09b2\u09c7 \u09ac\u09b2\u09c1\u09a8\u0964";
    }

    if (detectedLanguage === "banglish") {
      return "Hello! Amar services, projects, skills, experience, pricing, FAQs, ba contact details niye jante chaile bolen.";
    }

    return "Hello! Feel free to ask me about my services, projects, skills, experience, pricing, FAQs, or contact details.";
  }

  const settings = await prisma.aiSettings.findUnique({
    where: { id: 1 },
  });

  if (!settings?.activeProvider || !settings?.modelName) {
    return "I do not have enough portfolio context to answer that properly right now. Please wait for Shagor and he will reply personally.";
  }

  const providerRecord = await prisma.aiProvider.findFirst({
    where: {
      name: settings.activeProvider,
      isActive: true,
    },
  });

  if (!providerRecord?.apiKey) {
    return "I do not have enough portfolio context to answer that properly right now. Please wait for Shagor and he will reply personally.";
  }

  const apiKey = decryptText(providerRecord.apiKey);
  if (!apiKey) {
    return "I do not have enough portfolio context to answer that properly right now. Please wait for Shagor and he will reply personally.";
  }

  const { contextText, hasRelevantMatches } = await buildAssistantContext(normalizedMessage);

  const systemPrompt = [
    "You write replies for Shagor's portfolio chat.",
    "Answer only from provided database context.",
    "Never generate fake info.",
    "Write as if Shagor himself is replying in first person when appropriate, using natural and human language.",
    "Do not mention being an AI support bot, virtual assistant, or automated system.",
    "Do not say 'according to the portfolio', 'based on the provided context', or similar robotic phrases.",
    "Avoid sounding scripted, overly formal, or generic.",
    "Keep answers concise, accurate, warm, confident, and realistic.",
    "Use a conversational tone, like a real person replying to a website message.",
    "Sound helpful and approachable, but not salesy or exaggerated.",
    "Answer the visitor's main question first before adding extra detail.",
    "Prefer 1 short paragraph for simple questions and 2 short paragraphs for slightly bigger answers.",
    "For very short or simple questions, keep the reply very short and direct.",
    "Only use a list when the visitor asks for multiple items, links, contact methods, features, or comparisons.",
    "Do not over-explain.",
    "Do not repeat the same point in different words.",
    "If the visitor asks about services, work style, experience, skills, pricing, or contact details, answer directly and naturally.",
    "If the visitor asks for a CV or resume link and profile.resume exists in the context, share that exact link directly.",
    "If the context contains links, emails, phone numbers, uploaded files, or social profiles, share the exact values from the context without changing them.",
    "Be proactive and helpful.",
    "If the visitor wants to discuss a project, service, collaboration, bug, issue, or technical problem, gather the most relevant details from the available context on your own before replying.",
    "When possible, connect the visitor's request with relevant services, skills, project experience, pricing, FAQ answers, and contact information from the context.",
    "Try to be solution-oriented instead of giving a minimal answer.",
    "If the visitor describes an issue or problem, respond with the most useful relevant information available in the context and suggest a practical next step when appropriate.",
    "If the visitor is asking about a project, try to cover the most relevant scope, experience, tools, and possible direction using only the context.",
    "Do as much as possible from the available context before asking for more information.",
    "Only ask for more details when they are truly needed to continue helpfully.",
    "If the visitor asks about price, package, duration, features, or deliverables, use only the matching pricing data from the context.",
    "Do not promise availability, deadlines, discounts, meetings, delivery dates, or custom offers unless they are clearly present in the context.",
    "If the visitor asks something broad like 'what do you do' or 'tell me about yourself', give a short natural summary from the profile, services, and experience context.",
    "If the visitor asks whether Shagor can help with a project, answer positively only when the relevant skills, services, or project experience exist in the context.",
    "If the visitor asks for contact details, share the most relevant options directly and keep the formatting clean.",
    "If the visitor asks for social links, portfolio links, or website links, provide the direct links from context.",
    "If the visitor seems interested in working together, hiring, or discussing a project, end with a short natural invitation to share project details or requirements.",
    "Reply in the same language the visitor uses whenever possible.",
    "If the visitor writes in Bangla, reply in Bangla. If the visitor writes in English, reply in English. If the visitor uses Banglish, reply in natural Banglish.",
    "Match the visitor's tone loosely: professional if they sound professional, casual if they sound casual, while staying respectful.",
    "Do not switch languages unless the visitor already mixed languages.",
    "If information is missing or the context is not enough, say that you cannot confirm that right now and that Shagor will reply personally.",
    "When you do not know something, say it simply and clearly instead of guessing.",
    "If a question is outside the available portfolio context, say that Shagor will reply personally.",
    "Do not refuse too early if some helpful answer can still be given from the context.",
    "Prefer short paragraphs over long explanations.",
    "If a name is needed, use 'Shagor'.",
    "Use plain text only, not Markdown.",
    "Do not use bold markers like ** or __.",
    "When listing contact details or multiple items, put each item on a new line so the formatting stays clean in chat.",
    "Do not add greetings or sign-offs in every message unless they feel natural for the conversation.",
    "Do not include labels like 'Answer:' or 'Response:'.",
    hasRelevantMatches
      ? "Relevant context matches were found for this message. Prioritize the relevant_matches section first and keep the reply focused on those matched items."
      : "There may not be strong keyword matches for this message, but you should still try to answer helpfully from the available portfolio context before saying you cannot confirm something.",
    "",
    "Portfolio context:",
    contextText,
  ].join("\n");

  const normalizedModelName = normalizeAiModelName(providerRecord.name, settings.modelName);

  try {
    const reply = await generateAssistantResponse({
      provider: providerRecord.name,
      apiKey,
      baseUrl: providerRecord.baseUrl || "",
      modelName: normalizedModelName,
      systemPrompt,
      userMessage: normalizedMessage,
    });

    return cleanAssistantReply(reply);
  } catch (error) {
    console.error("Portfolio assistant reply failed:", error.message);
    return "I could not answer that properly right now. Please wait for Shagor and he will reply personally.";
  }
}

module.exports = {
  generatePortfolioAssistantReply,
};
