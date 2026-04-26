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
  const safeTag = tag || `chat-message-${audience}-${ticketId || "unknown"}-${Date.now()}`;
  const options = {
    body: notificationBody,
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
        await registration.showNotification(notificationTitle, options);
        return true;
      }
    } catch (_error) {
      // Fall through to the window notification API.
    }
  }

  try {
    const notification = new Notification(notificationTitle, options);
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
