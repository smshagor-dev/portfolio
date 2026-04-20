import { FaDiscord, FaDribbble, FaFacebookF, FaFigma, FaGithub, FaGitlab, FaGlobe, FaInstagram, FaLinkedin, FaMedium, FaPinterestP, FaRedditAlien, FaSlack, FaTelegramPlane, FaTiktok, FaTwitch, FaTwitter, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { SiBehance, SiDevdotto, SiLeetcode, SiStackoverflow } from "react-icons/si";

export const socialIconOptions = [
  { value: "facebook", label: "Facebook", icon: FaFacebookF, tags: ["meta", "fb"] },
  { value: "github", label: "GitHub", icon: FaGithub, tags: ["code", "repo"] },
  { value: "gitlab", label: "GitLab", icon: FaGitlab, tags: ["code", "repo"] },
  { value: "linkedin", label: "LinkedIn", icon: FaLinkedin, tags: ["jobs", "network"] },
  { value: "twitter", label: "Twitter / X", icon: FaTwitter, tags: ["x", "tweet"] },
  { value: "instagram", label: "Instagram", icon: FaInstagram, tags: ["photo", "reels"] },
  { value: "youtube", label: "YouTube", icon: FaYoutube, tags: ["video", "channel"] },
  { value: "discord", label: "Discord", icon: FaDiscord, tags: ["community", "chat"] },
  { value: "telegram", label: "Telegram", icon: FaTelegramPlane, tags: ["chat", "messenger"] },
  { value: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, tags: ["chat", "phone"] },
  { value: "reddit", label: "Reddit", icon: FaRedditAlien, tags: ["community", "forum"] },
  { value: "tiktok", label: "TikTok", icon: FaTiktok, tags: ["shorts", "video"] },
  { value: "twitch", label: "Twitch", icon: FaTwitch, tags: ["stream", "gaming"] },
  { value: "pinterest", label: "Pinterest", icon: FaPinterestP, tags: ["boards", "design"] },
  { value: "slack", label: "Slack", icon: FaSlack, tags: ["team", "chat"] },
  { value: "dribbble", label: "Dribbble", icon: FaDribbble, tags: ["design", "portfolio"] },
  { value: "behance", label: "Behance", icon: SiBehance, tags: ["design", "portfolio"] },
  { value: "medium", label: "Medium", icon: FaMedium, tags: ["blog", "writing"] },
  { value: "devto", label: "DEV", icon: SiDevdotto, tags: ["blog", "developer"] },
  { value: "stackoverflow", label: "Stack Overflow", icon: SiStackoverflow, tags: ["developer", "questions"] },
  { value: "leetcode", label: "LeetCode", icon: SiLeetcode, tags: ["coding", "interview"] },
  { value: "figma", label: "Figma", icon: FaFigma, tags: ["design", "ui"] },
  { value: "website", label: "Website", icon: FaGlobe, tags: ["portfolio", "url", "site"] },
];

export function getSocialIconOption(value) {
  return socialIconOptions.find((item) => item.value === value) || null;
}

export function searchSocialIcons(query) {
  const normalized = String(query || "").trim().toLowerCase();

  if (!normalized) {
    return socialIconOptions;
  }

  return socialIconOptions.filter((item) => {
    const haystack = [item.value, item.label, ...(item.tags || [])].join(" ").toLowerCase();
    return haystack.includes(normalized);
  });
}
