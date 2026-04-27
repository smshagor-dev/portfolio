const {
  generateWithDeepSeek,
  generateWithGemini,
  generateWithOpenAI,
} = require("./providers");

async function generateAssistantResponse({
  provider,
  apiKey,
  baseUrl,
  modelName,
  systemPrompt,
  userMessage,
}) {
  switch (String(provider || "").trim().toLowerCase()) {
    case "openai":
      return generateWithOpenAI({
        apiKey,
        baseUrl,
        modelName,
        systemPrompt,
        userMessage,
      });
    case "deepseek":
      return generateWithDeepSeek({
        apiKey,
        baseUrl,
        modelName,
        systemPrompt,
        userMessage,
      });
    case "gemini":
      return generateWithGemini({
        apiKey,
        baseUrl,
        modelName,
        systemPrompt,
        userMessage,
      });
    default:
      throw new Error("Unsupported AI provider selected.");
  }
}

module.exports = {
  generateAssistantResponse,
};
