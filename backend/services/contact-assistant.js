const prisma = require("../lib/prisma");
const { buildAssistantContext } = require("../lib/assistant-context");
const { decryptText } = require("../utils/encryption");
const { generateAssistantResponse } = require("./ai");

function normalizeString(value) {
  return String(value || "").trim();
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

  if (!normalizedMessage) {
    return "";
  }

  if (isGreetingMessage(normalizedMessage)) {
    return "Hello! I am Shagor Assistant. You can ask me about Shagor's services, projects, skills, experience, pricing, FAQs, or contact details.";
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

  if (!hasRelevantMatches) {
    return "I do not have enough portfolio context to answer that properly right now. Please wait for Shagor and he will reply personally.";
  }

  const systemPrompt = [
    "You are Shagor's personal portfolio assistant.",
    "Answer only from provided database context.",
    "Never generate fake info.",
    "Reply as 'Shagor Assistant' when a name is needed.",
    "Do not mention being an AI support bot.",
    "If information is missing or the context is not enough, clearly say you do not have enough context right now and ask the visitor to wait for Shagor.",
    "Keep answers concise, accurate, warm, and helpful.",
    "",
    "Portfolio context:",
    contextText,
  ].join("\n");

  const normalizedModelName = normalizeAiModelName(providerRecord.name, settings.modelName);

  try {
    return await generateAssistantResponse({
      provider: providerRecord.name,
      apiKey,
      baseUrl: providerRecord.baseUrl || "",
      modelName: normalizedModelName,
      systemPrompt,
      userMessage: normalizedMessage,
    });
  } catch (error) {
    console.error("Portfolio assistant reply failed:", error.message);
    return "I could not answer that properly right now. Please wait for Shagor and he will reply personally.";
  }
}

module.exports = {
  generatePortfolioAssistantReply,
};
