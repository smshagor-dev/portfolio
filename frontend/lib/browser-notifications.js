import { buildContactChatHash } from "@/lib/contact-chat-link";

const SERVICE_WORKER_PATH = "/service-worker.js";

function canUseBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function canUseServiceWorkerNotifications() {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
}

export async function registerNotificationServiceWorker() {
  if (!canUseServiceWorkerNotifications()) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  } catch (_error) {
    return null;
  }
}

export async function ensureNotificationPermission() {
  if (!canUseBrowserNotifications()) {
    return "denied";
  }

  if (Notification.permission !== "default") {
    return Notification.permission;
  }

  try {
    return await Notification.requestPermission();
  } catch (_error) {
    return "denied";
  }
}

function buildChatNotificationUrl({ audience = "visitor", ticketId, ticketToken }) {
  if (audience === "admin") {
    return "/admin/messages";
  }

  const chatHash = buildContactChatHash(ticketId, ticketToken);
  return chatHash ? `/chat/${chatHash}` : "/";
}

async function showBrowserNotification({ title, body, url = "/", tag }) {
  if (!canUseBrowserNotifications()) {
    return false;
  }

  const permission = await ensureNotificationPermission();
  if (permission !== "granted") {
    return false;
  }

  const safeTag = tag || `notification-${Date.now()}`;
  const options = {
    body,
    tag: safeTag,
    renotify: true,
    requireInteraction: false,
    data: {
      url,
    },
  };

  if (canUseServiceWorkerNotifications()) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
        || (await registerNotificationServiceWorker());

      if (registration?.showNotification) {
        await registration.showNotification(title, options);
        return true;
      }
    } catch (_error) {
      // Fall through to the window notification API.
    }
  }

  try {
    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();

      if (url) {
        window.location.href = url;
      }
    };
    return true;
  } catch (_error) {
    return false;
  }
}

export async function showChatMessageNotification({
  audience = "visitor",
  senderName,
  ticketId,
  ticketToken,
  message,
  websiteTitle = "Portfolio Website",
  tag,
}) {
  if (!canUseBrowserNotifications()) {
    return false;
  }

  const permission = await ensureNotificationPermission();
  if (permission !== "granted") {
    return false;
  }

  const notificationTitle =
    audience === "admin" ? `New message from ${senderName || "Visitor"}` : `${websiteTitle} replied`;
  const notificationBody =
    String(message || "").trim() || (audience === "admin" ? "A visitor sent you a new message." : "You received a new reply.");
  const url = buildChatNotificationUrl({ audience, ticketId, ticketToken });
  return showBrowserNotification({
    title: notificationTitle,
    body: notificationBody,
    url,
    tag: tag || `chat-message-${audience}-${ticketId || "unknown"}-${Date.now()}`,
  });
}

export async function showArticlePublishedNotification({
  title,
  url,
  websiteTitle = "Portfolio Website",
  tag,
}) {
  const articleTitle = String(title || "").trim() || "New article published";
  return showBrowserNotification({
    title: `${websiteTitle} published a new article`,
    body: articleTitle,
    url: url || "/artical",
    tag: tag || `article-published-${articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  });
}
