"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { FiBell, FiCheck, FiClock, FiExternalLink, FiMail, FiMessageSquare, FiTrash2, FiX } from "react-icons/fi";
import { buildPublicApiUrl, getSocketServerUrl } from "@/lib/public-backend-url";

const socketServerUrl = getSocketServerUrl();

function adminFetch(input, init = {}) {
  return fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init.headers || {}),
    },
  });
}

function formatNotificationTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString();
}

function truncatePreview(value, maxLength = 120) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function extractFieldFromBody(body, label) {
  const normalizedBody = String(body || "");
  if (!normalizedBody) {
    return "";
  }

  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = normalizedBody.match(new RegExp(`^${escapedLabel}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim?.() || "";
}

function getNotificationTypeLabel(type) {
  return type === "NEW_MESSAGE" ? "New" : "Reply";
}

function NotificationToast({ notification, onOpen, onClose }) {
  const subject = extractFieldFromBody(notification.body, "Subject");

  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-[1.4rem] border border-[#28405f] bg-[linear-gradient(180deg,rgba(15,25,41,0.97),rgba(8,15,27,0.96))] p-4 text-white shadow-[0_22px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#335172] bg-[#11253a] text-[#82ddff]">
          {notification.type === "NEW_MESSAGE" ? <FiMail size={18} /> : <FiMessageSquare size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8fdcff]">{getNotificationTypeLabel(notification.type)}</p>
              <h4 className="mt-1 text-sm font-semibold text-white">{notification.title}</h4>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[#a9bfd6] transition hover:border-[#4dc4ff] hover:text-white"
              aria-label="Close notification"
            >
              <FiX size={14} />
            </button>
          </div>
          <div className="mt-3 space-y-1 text-sm text-[#c8d7e7]">
            {notification.visitorName ? <p className="truncate">Name: {notification.visitorName}</p> : null}
            {notification.visitorEmail ? <p className="truncate">Email: {notification.visitorEmail}</p> : null}
            {notification.visitorPhone ? <p className="truncate">Phone: {notification.visitorPhone}</p> : null}
            {subject ? <p className="truncate">Subject: {subject}</p> : null}
            {notification.preview ? <p className="line-clamp-2 text-[#dbe9f6]">{truncatePreview(notification.preview, 140)}</p> : null}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-[#8ea7c2]">{formatNotificationTime(notification.createdAt)}</span>
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex items-center gap-2 rounded-full border border-[#335172] bg-[#11253a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9fe4ff] transition hover:border-[#4dc4ff] hover:text-white"
            >
              <FiExternalLink size={13} />
              {notification.type === "NEW_MESSAGE" ? "View message" : "View conversation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminNotificationCenter({
  token = "",
  currentMessageId = null,
  onOpenMessage,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const popupIdsRef = useRef(new Set());
  const notificationsRef = useRef([]);

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.isRead),
    [notifications],
  );

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const upsertNotification = useCallback((notification) => {
    if (!notification?.id) {
      return;
    }

    setNotifications((current) => {
      const existingIndex = current.findIndex((item) => item.id === notification.id);
      if (existingIndex === -1) {
        return [notification, ...current].slice(0, 20);
      }

      const next = [...current];
      next[existingIndex] = {
        ...next[existingIndex],
        ...notification,
      };
      return next;
    });
  }, []);

  const refreshUnreadCount = useCallback(async (authToken) => {
    if (!authToken) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await adminFetch(buildPublicApiUrl("/api/admin/notifications/unread-count"), {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load unread count.");
      }

      setUnreadCount(Number(data.count || 0));
    } catch (_error) {
      // Keep the current count if a background refresh fails.
    }
  }, []);

  const loadNotifications = useCallback(async (authToken, { background = false } = {}) => {
    if (!authToken) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (!background) {
      setIsLoading(true);
    }

    try {
      const response = await adminFetch(buildPublicApiUrl("/api/admin/notifications?limit=12&page=1"), {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notifications.");
      }

      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(
        Array.isArray(data.notifications)
          ? data.notifications.filter((item) => !item.isRead).length
          : 0,
      );
    } catch (_error) {
      // Keep existing notifications if loading fails.
    } finally {
      if (!background) {
        setIsLoading(false);
      }
    }
  }, []);

  const markNotificationRead = useCallback(async (notificationId, { optimistic = true } = {}) => {
    if (!token || !notificationId) {
      return;
    }

    if (optimistic) {
      setNotifications((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    }

    try {
      const response = await adminFetch(buildPublicApiUrl(`/api/admin/notifications/${notificationId}/read`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark notification as read.");
      }

      if (data.notification?.id) {
        upsertNotification(data.notification);
      }
    } catch (_error) {
      await loadNotifications(token, { background: true });
    }
  }, [loadNotifications, token, upsertNotification]);

  const handleDeleteNotification = useCallback(async (notificationId) => {
    if (!token || !notificationId) {
      return;
    }

    const target = notifications.find((item) => item.id === notificationId);
    setNotifications((current) => current.filter((item) => item.id !== notificationId));
    if (target && !target.isRead) {
      setUnreadCount((current) => Math.max(0, current - 1));
    }

    try {
      const response = await adminFetch(buildPublicApiUrl(`/api/admin/notifications/${notificationId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete notification.");
      }
    } catch (_error) {
      await loadNotifications(token, { background: true });
    }
  }, [loadNotifications, notifications, token]);

  const handleMarkAllRead = useCallback(async () => {
    if (!token || unreadNotifications.length === 0) {
      return;
    }

    setIsMarkingAll(true);
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);

    try {
      const response = await adminFetch(buildPublicApiUrl("/api/admin/notifications/read-all"), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark all notifications as read.");
      }
    } catch (_error) {
      await loadNotifications(token, { background: true });
    } finally {
      setIsMarkingAll(false);
    }
  }, [loadNotifications, token, unreadNotifications.length]);

  const openNotification = useCallback((notification) => {
    if (!notification) {
      return;
    }

    if (!notification.isRead) {
      markNotificationRead(notification.id);
    }

    if (typeof onOpenMessage === "function" && notification.messageId) {
      onOpenMessage({
        messageId: notification.messageId,
        notificationId: notification.id,
        actionUrl: notification.actionUrl,
      });
      setIsOpen(false);
      return;
    }

    if (notification.actionUrl && typeof window !== "undefined") {
      window.location.href = notification.actionUrl;
    }
  }, [markNotificationRead, onOpenMessage]);

  const showPopup = useCallback((notification) => {
    if (!notification?.id || popupIdsRef.current.has(notification.id)) {
      return;
    }

    popupIdsRef.current.add(notification.id);
    const toastId = `admin-notification-${notification.id}`;
    toast(
      ({ closeToast }) => (
        <NotificationToast
          notification={notification}
          onClose={closeToast}
          onOpen={() => {
            openNotification(notification);
            closeToast();
          }}
        />
      ),
      {
        toastId,
        position: "top-right",
        autoClose: 7000,
        closeButton: false,
        hideProgressBar: true,
        className: "!bg-transparent !shadow-none !p-0",
        bodyClassName: "!p-0",
      },
    );
  }, [openNotification]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    loadNotifications(token);
    refreshUnreadCount(token);
    const interval = window.setInterval(() => {
      loadNotifications(token, { background: true });
      refreshUnreadCount(token);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadNotifications, refreshUnreadCount, token]);

  useEffect(() => {
    if (!token || !socketServerUrl) {
      return undefined;
    }

    const socket = io(socketServerUrl, {
      transports: ["websocket"],
    });

    function handleIncomingNotification(payload) {
      const notification = payload?.notification;
      if (!notification?.id) {
        return;
      }

      const existingNotification = notificationsRef.current.find((item) => item.id === notification.id);
      upsertNotification(notification);
      if (!existingNotification && !notification.isRead) {
        setUnreadCount((current) => current + 1);
        showPopup(notification);
      }
    }

    socket.on("admin:new-message", handleIncomingNotification);
    socket.on("admin:message-reply", handleIncomingNotification);

    return () => {
      socket.off("admin:new-message", handleIncomingNotification);
      socket.off("admin:message-reply", handleIncomingNotification);
      socket.disconnect();
    };
  }, [showPopup, token, upsertNotification]);

  useEffect(() => {
    if (!currentMessageId || !token) {
      return;
    }

    const matchingUnread = notifications.filter((item) => {
      if (item.isRead) {
        return false;
      }

      return item.messageId === currentMessageId || item.conversationId === currentMessageId;
    });

    if (matchingUnread.length === 0) {
      return;
    }

    matchingUnread.forEach((item) => {
      markNotificationRead(item.id);
    });
  }, [currentMessageId, markNotificationRead, notifications, token]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(17,34,59,0.86),rgba(12,22,38,0.92))] text-white shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition hover:border-[#4dc4ff] hover:text-[#9fe4ff]"
        aria-label="Open notifications"
      >
        <FiBell size={18} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f97316,#ef4444)] px-1.5 py-1 text-[10px] font-bold text-white shadow-[0_10px_24px_rgba(239,68,68,0.35)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-[70] mt-3 w-[22rem] overflow-hidden rounded-[1.6rem] border border-[#28405f] bg-[linear-gradient(180deg,rgba(11,20,34,0.98),rgba(7,13,23,0.98))] shadow-[0_30px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:w-[26rem]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8fdcff]">Notifications</p>
              <p className="mt-1 text-sm text-[#c2d3e5]">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "All caught up"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll || unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-full border border-[#335172] bg-[#11253a] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9fe4ff] transition hover:border-[#4dc4ff] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiCheck size={13} />
              Mark all read
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto px-3 py-3">
            {isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-24 animate-pulse rounded-[1.3rem] border border-white/10 bg-white/[0.04]" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-[1.3rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center">
                <p className="text-sm text-[#9db1c7]">No notifications yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const subject = extractFieldFromBody(notification.body, "Subject");
                  return (
                  <div
                    key={notification.id}
                    className={`rounded-[1.35rem] border p-4 transition ${
                      notification.isRead
                        ? "border-white/8 bg-white/[0.03]"
                        : "border-[#36557e] bg-[linear-gradient(180deg,rgba(18,37,58,0.8),rgba(11,20,34,0.92))]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                        notification.isRead
                          ? "border-white/10 bg-white/[0.03] text-[#9fb1c7]"
                          : "border-[#335172] bg-[#11253a] text-[#82ddff]"
                      }`}>
                        {notification.type === "NEW_MESSAGE" ? <FiMail size={17} /> : <FiMessageSquare size={17} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8fdcff]">
                              {getNotificationTypeLabel(notification.type)}
                            </p>
                            <h4 className="mt-1 text-sm font-semibold text-white">{notification.title}</h4>
                          </div>
                          {!notification.isRead ? (
                            <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                              Unread
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-[#c3d3e4]">
                          {notification.visitorEmail ? <p className="truncate">Email: {notification.visitorEmail}</p> : null}
                          {notification.visitorPhone ? <p className="truncate">Phone: {notification.visitorPhone}</p> : null}
                          {subject ? <p className="truncate">Subject: {subject}</p> : null}
                          {notification.preview ? <p className="line-clamp-2 text-[#dbe9f6]">{truncatePreview(notification.preview, 132)}</p> : null}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8ea7c2]">
                          <span className="inline-flex items-center gap-1">
                            <FiClock size={12} />
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openNotification(notification)}
                            className="inline-flex items-center gap-2 rounded-full border border-[#335172] bg-[#11253a] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9fe4ff] transition hover:border-[#4dc4ff] hover:text-white"
                          >
                            <FiExternalLink size={12} />
                            {notification.type === "NEW_MESSAGE" ? "View message" : "View conversation"}
                          </button>
                          {!notification.isRead ? (
                            <button
                              type="button"
                              onClick={() => markNotificationRead(notification.id)}
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c6d8ea] transition hover:border-[#4dc4ff] hover:text-white"
                            >
                              <FiCheck size={12} />
                              Mark read
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-200 transition hover:border-red-400/40 hover:text-white"
                          >
                            <FiTrash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
