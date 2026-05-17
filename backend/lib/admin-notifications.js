const prisma = require("./prisma");

function normalizeString(value) {
  return String(value || "").trim();
}

function buildMessageActionUrl(messageId) {
  const normalizedId = Number.parseInt(messageId, 10);
  if (!normalizedId) {
    return "/admin/messages";
  }

  return `/admin/messages?messageId=${normalizedId}`;
}

function buildNotificationPreview(value) {
  const normalized = normalizeString(value).replace(/\s+/g, " ");
  if (!normalized) {
    return "";
  }

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177).trimEnd()}...`;
}

function buildNotificationTitle(type, visitorName) {
  const safeName = normalizeString(visitorName) || "Visitor";

  if (type === "NEW_MESSAGE") {
    return `You have a new message from ${safeName}`;
  }

  if (normalizeString(visitorName)) {
    return `You have a message reply from ${safeName}`;
  }

  return "You have a message reply";
}

function buildNotificationBody({
  type,
  visitorName,
  visitorEmail,
  visitorPhone,
  subject,
  preview,
}) {
  const lines = [];
  const safeName = normalizeString(visitorName);
  const safeEmail = normalizeString(visitorEmail);
  const safePhone = normalizeString(visitorPhone);
  const safeSubject = normalizeString(subject);
  const safePreview = buildNotificationPreview(preview);

  if (safeName) {
    lines.push(`Name: ${safeName}`);
  }

  if (safeEmail) {
    lines.push(`Email: ${safeEmail}`);
  }

  if (safePhone) {
    lines.push(`Phone: ${safePhone}`);
  }

  if (safeSubject) {
    lines.push(`Subject: ${safeSubject}`);
  }

  if (safePreview) {
    lines.push(type === "NEW_MESSAGE" ? `Message: ${safePreview}` : `Reply: ${safePreview}`);
  }

  return lines.join("\n");
}

function serializeAdminNotification(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body || "",
    visitorName: notification.visitorName || "",
    visitorEmail: notification.visitorEmail || "",
    visitorPhone: notification.visitorPhone || "",
    messageId: notification.messageId || null,
    conversationId: notification.conversationId || null,
    preview: notification.preview || "",
    actionUrl: notification.actionUrl || "",
    isRead: Boolean(notification.isRead),
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

async function createAdminNotification({
  type,
  visitorName,
  visitorEmail,
  visitorPhone,
  messageId,
  conversationId,
  subject,
  preview,
  actionUrl,
}) {
  const normalizedMessageId = Number.parseInt(messageId, 10) || null;
  const normalizedConversationId = Number.parseInt(conversationId, 10) || normalizedMessageId;
  const normalizedPreview = buildNotificationPreview(preview);
  const notification = await prisma.adminNotification.create({
    data: {
      type,
      title: buildNotificationTitle(type, visitorName),
      body: buildNotificationBody({
        type,
        visitorName,
        visitorEmail,
        visitorPhone,
        subject,
        preview: normalizedPreview,
      }),
      visitorName: normalizeString(visitorName) || null,
      visitorEmail: normalizeString(visitorEmail) || null,
      visitorPhone: normalizeString(visitorPhone) || null,
      messageId: normalizedMessageId,
      conversationId: normalizedConversationId,
      preview: normalizedPreview || null,
      actionUrl: normalizeString(actionUrl) || buildMessageActionUrl(normalizedMessageId),
      isRead: false,
    },
  });

  return serializeAdminNotification(notification);
}

function emitAdminNotification(io, eventName, notification) {
  if (!io || !eventName || !notification) {
    return;
  }

  io.emit(eventName, {
    type: notification.type,
    title: notification.title,
    notification,
  });
}

module.exports = {
  buildMessageActionUrl,
  createAdminNotification,
  emitAdminNotification,
  serializeAdminNotification,
};
