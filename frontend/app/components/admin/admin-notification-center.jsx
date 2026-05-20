"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import {
  FiBell,
  FiCheck,
  FiExternalLink,
  FiMail,
  FiMessageSquare,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
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

function isUrgentNotification(notification) {
  const source = `${notification?.latestMessagePreview || ""} ${notification?.subject || ""}`.toLowerCase();
  return /\b(urgent|asap|emergency|immediate)\b/.test(source) || source.includes("\u099c\u09b0\u09c1\u09b0\u09bf");
}

function getNotificationTypeLabel(type, notification) {
  if (isUrgentNotification(notification)) {
    return "Urgent";
  }

  return type === "MESSAGE" ? "Message" : "Reply";
}

function getNotificationIcon(notification, size = 18) {
  if (isUrgentNotification(notification)) {
    return <FiBell size={size} />;
  }

  return notification.type === "MESSAGE" ? <FiMail size={size} /> : <FiMessageSquare size={size} />;
}

function sortNotificationsByLatest(items) {
  return [...items].sort(
    (left, right) => new Date(right?.latestCreatedAt || 0).getTime() - new Date(left?.latestCreatedAt || 0).getTime(),
  );
}

function getBellWidth() {
  if (typeof window === "undefined") {
    return 392;
  }

  if (window.innerWidth < 640) {
    return Math.min(window.innerWidth - 24, 360);
  }

  if (window.innerWidth < 1024) {
    return Math.min(window.innerWidth - 40, 380);
  }

  return 392;
}

function buildDropdownPosition(rect) {
  if (typeof window === "undefined" || !rect) {
    return {
      top: 84,
      left: 16,
      width: 392,
    };
  }

  const viewportWidth = window.innerWidth;
  const width = Math.max(320, Math.min(getBellWidth(), viewportWidth - 24));
  const horizontalPadding = viewportWidth < 640 ? 12 : 20;
  const preferredLeft = rect.right - width;
  const left = Math.min(
    Math.max(horizontalPadding, preferredLeft),
    viewportWidth - width - horizontalPadding,
  );

  return {
    top: rect.bottom + 12,
    left,
    width,
  };
}

function NotificationToast({ notification, onOpen, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="pointer-events-auto w-full max-w-[340px] overflow-hidden rounded-[1.55rem] border border-white/12 bg-[linear-gradient(180deg,rgba(13,22,36,0.96),rgba(9,16,28,0.94))] p-4 text-white shadow-[0_24px_60px_rgba(0,0,0,0.38)] ring-1 ring-white/6 backdrop-blur-2xl"
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
          isUrgentNotification(notification)
            ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
            : "border-[#335172] bg-[#11253a] text-[#82ddff]"
        }`}>
          {getNotificationIcon(notification, 18)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                isUrgentNotification(notification) ? "text-amber-100" : "text-[#8fdcff]"
              }`}>
                {getNotificationTypeLabel(notification.type, notification)}
              </p>
              <h4 className="mt-1 text-sm font-semibold leading-5 text-white">
                {notification.subject || notification.senderName || "Conversation update"}
              </h4>
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

          <div className="mt-3 space-y-1.5 text-sm text-[#c8d7e7]">
            {notification.senderName ? <p className="truncate">Name: {notification.senderName}</p> : null}
            {notification.email ? <p className="truncate">Email: {notification.email}</p> : null}
            <p className="text-[#8ea7c2]">
              {notification.messageCount} message{notification.messageCount === 1 ? "" : "s"}
              {notification.unreadCount > 0 ? ` | ${notification.unreadCount} unread` : ""}
            </p>
            {notification.latestMessagePreview ? (
              <p className="line-clamp-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[#dbe9f6]">
                {truncatePreview(notification.latestMessagePreview, 140)}
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-[#8ea7c2]">{formatNotificationTime(notification.latestCreatedAt)}</span>
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex items-center gap-2 rounded-full border border-[#335172] bg-[#11253a] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9fe4ff] transition hover:border-[#4dc4ff] hover:text-white"
            >
              <FiExternalLink size={13} />
              View conversation
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NotificationItem({
  notification,
  onOpen,
  onMarkRead,
  onDelete,
}) {
  const isUnread = Number(notification.unreadCount || 0) > 0;

  return (
    <motion.div
      layout
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`group relative overflow-hidden rounded-[1.45rem] border p-4 transition ${
        isUnread
          ? "border-[#36557e] bg-[linear-gradient(180deg,rgba(17,34,58,0.88),rgba(11,20,34,0.96))] shadow-[0_18px_36px_rgba(0,0,0,0.18)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="relative shrink-0">
          <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${
            isUrgentNotification(notification)
              ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
              : isUnread
                ? "border-[#335172] bg-[#11253a] text-[#82ddff]"
                : "border-white/10 bg-white/[0.03] text-[#9fb1c7]"
          }`}>
            {notification.senderName ? <FiUser size={18} /> : getNotificationIcon(notification, 18)}
          </span>
          {isUnread ? (
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-[#0b1524] bg-[#54c8ff]" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                isUrgentNotification(notification) ? "text-amber-100" : "text-[#8fdcff]"
              }`}>
                {getNotificationTypeLabel(notification.type, notification)}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h4 className="min-w-0 text-sm font-semibold leading-5 text-white">
                  {notification.subject || notification.senderName || "Conversation update"}
                </h4>
                <span className="rounded-full border border-[#335172] bg-[#11253a] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9fe4ff]">
                  {notification.messageCount} message{notification.messageCount === 1 ? "" : "s"}
                </span>
                {notification.unreadCount > 0 ? (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#dbe9f6]">
                    {notification.unreadCount} unread
                  </span>
                ) : null}
              </div>
            </div>
            <span className="shrink-0 text-[11px] text-[#8ea7c2]">
              {formatNotificationTime(notification.latestCreatedAt)}
            </span>
          </div>

          <div className="mt-3 space-y-1.5 text-sm text-[#c3d3e4]">
            {notification.senderName ? <p className="truncate">Name: {notification.senderName}</p> : null}
            {notification.email ? <p className="truncate">Email: {notification.email}</p> : null}
            {notification.latestMessagePreview ? (
              <p className="line-clamp-2 text-[#dbe9f6]">{truncatePreview(notification.latestMessagePreview, 132)}</p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onOpen(notification)}
              className="inline-flex items-center gap-2 rounded-full border border-[#335172] bg-[#11253a] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9fe4ff] transition hover:border-[#4dc4ff] hover:text-white"
            >
              <FiExternalLink size={12} />
              View conversation
            </button>

            {isUnread ? (
              <button
                type="button"
                onClick={() => onMarkRead(notification.groupId)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c6d8ea] transition hover:border-[#4dc4ff] hover:text-white"
              >
                <FiCheck size={12} />
                Mark read
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => onDelete(notification.groupId)}
              className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-200 transition hover:border-red-400/40 hover:text-white"
            >
              <FiTrash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
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
  const [portalReady, setPortalReady] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 84, left: 16, width: 392 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const popupIdsRef = useRef(new Set());
  const notificationsRef = useRef([]);

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => Number(item.unreadCount || 0) > 0),
    [notifications],
  );

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const syncDropdownPosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect?.();
    setDropdownPosition(buildDropdownPosition(rect));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    syncDropdownPosition();
    window.addEventListener("resize", syncDropdownPosition);
    window.addEventListener("scroll", syncDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", syncDropdownPosition);
      window.removeEventListener("scroll", syncDropdownPosition, true);
    };
  }, [isOpen, syncDropdownPosition]);

  const upsertNotification = useCallback((notification) => {
    if (!notification?.groupId) {
      return;
    }

    setNotifications((current) => {
      const existingIndex = current.findIndex((item) => item.groupId === notification.groupId);
      if (existingIndex === -1) {
        return sortNotificationsByLatest([notification, ...current]).slice(0, 20);
      }

      const next = [...current];
      next[existingIndex] = {
        ...next[existingIndex],
        ...notification,
      };
      return sortNotificationsByLatest(next);
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
      // Keep current count on background failure.
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

      const nextNotifications = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications(sortNotificationsByLatest(nextNotifications));
      refreshUnreadCount(authToken);
    } catch (_error) {
      // Keep current items if background fetch fails.
    } finally {
      if (!background) {
        setIsLoading(false);
      }
    }
  }, [refreshUnreadCount]);

  const markNotificationRead = useCallback(async (groupId, { optimistic = true } = {}) => {
    if (!token || !groupId) {
      return;
    }

    if (optimistic) {
      setNotifications((current) =>
        current.map((item) => (
          item.groupId === groupId
            ? { ...item, unreadCount: 0, isRead: true }
            : item
        )),
      );
    }

    try {
      const response = await adminFetch(buildPublicApiUrl(`/api/admin/notifications/${encodeURIComponent(groupId)}/read`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark notification as read.");
      }

      if (data.notification?.groupId) {
        upsertNotification(data.notification);
      }

      refreshUnreadCount(token);
    } catch (_error) {
      await loadNotifications(token, { background: true });
    }
  }, [loadNotifications, refreshUnreadCount, token, upsertNotification]);

  const handleDeleteNotification = useCallback(async (groupId) => {
    if (!token || !groupId) {
      return;
    }

    setNotifications((current) => current.filter((item) => item.groupId !== groupId));

    try {
      const response = await adminFetch(buildPublicApiUrl(`/api/admin/notifications/${encodeURIComponent(groupId)}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete notification.");
      }

      refreshUnreadCount(token);
    } catch (_error) {
      await loadNotifications(token, { background: true });
    }
  }, [loadNotifications, refreshUnreadCount, token]);

  const handleMarkAllRead = useCallback(async () => {
    if (!token || unreadNotifications.length === 0) {
      return;
    }

    setIsMarkingAll(true);
    setNotifications((current) => current.map((item) => ({ ...item, unreadCount: 0, isRead: true })));
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

    if (Number(notification.unreadCount || 0) > 0) {
      markNotificationRead(notification.groupId);
    }

    if (typeof onOpenMessage === "function" && notification.conversationId) {
      onOpenMessage({
        messageId: notification.conversationId,
        notificationId: notification.groupId,
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
    const popupKey = `${notification?.groupId || ""}:${notification?.latestCreatedAt || ""}`;
    if (!notification?.groupId || popupIdsRef.current.has(popupKey)) {
      return;
    }

    popupIdsRef.current.add(popupKey);
    const toastId = `admin-notification-${popupKey}`;
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
        className: "!bg-transparent !shadow-none !p-0 !m-0",
        bodyClassName: "!p-0",
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          marginTop: "0.25rem",
          width: "100%",
          maxWidth: "340px",
        },
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
      if (!notification?.groupId) {
        return;
      }

      const existingNotification = notificationsRef.current.find((item) => item.groupId === notification.groupId);
      upsertNotification(notification);

      if (
        Number(notification.unreadCount || 0) > 0 &&
        (
          !existingNotification ||
          Number(notification.unreadCount || 0) > Number(existingNotification.unreadCount || 0) ||
          notification.latestCreatedAt !== existingNotification.latestCreatedAt
        )
      ) {
        refreshUnreadCount(token);
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
  }, [refreshUnreadCount, showPopup, token, upsertNotification]);

  useEffect(() => {
    if (!currentMessageId || !token) {
      return;
    }

    const matchingUnread = notifications.filter((item) => (
      Number(item.unreadCount || 0) > 0 && item.conversationId === currentMessageId
    ));

    if (matchingUnread.length === 0) {
      return;
    }

    matchingUnread.forEach((item) => {
      markNotificationRead(item.groupId);
    });
  }, [currentMessageId, markNotificationRead, notifications, token]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      const target = event.target;
      const isInsideTrigger = triggerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      if (!isInsideTrigger && !isInsideDropdown) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const dropdownContent = portalReady ? createPortal(
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="notification-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-[88] bg-transparent"
          />

          <motion.div
            key="notification-dropdown"
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.8 }}
            style={{
              position: "fixed",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxWidth: "calc(100vw - 24px)",
            }}
            className="z-[90] overflow-hidden rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(11,20,34,0.96),rgba(7,13,23,0.94))] shadow-[0_32px_80px_rgba(0,0,0,0.42)] ring-1 ring-white/6 backdrop-blur-3xl"
          >
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8fdcff]">Notifications</p>
                  <p className="mt-1 text-sm text-[#c2d3e5]">
                    {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "All caught up"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={isMarkingAll || unreadCount === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-[#335172] bg-[#11253a] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9fe4ff] transition hover:border-[#4dc4ff] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiCheck size={13} />
                    Mark all read
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-[#a9bfd6] transition hover:border-[#4dc4ff] hover:text-white"
                    aria-label="Close notifications"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-[min(70vh,34rem)] overflow-y-auto px-3 py-3 sm:px-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="h-24 animate-pulse rounded-[1.35rem] border border-white/10 bg-white/[0.04]" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-[1.35rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center">
                  <p className="text-sm text-[#9db1c7]">No notifications yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.groupId}
                      notification={notification}
                      onOpen={openNotification}
                      onMarkRead={markNotificationRead}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  ) : null;

  return (
    <>
      <div className="relative z-20 shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            syncDropdownPosition();
            setIsOpen((current) => !current);
          }}
          className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(17,34,59,0.86),rgba(12,22,38,0.92))] text-white shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition hover:border-[#4dc4ff] hover:text-[#9fe4ff]"
          aria-label="Open notifications"
        >
          <FiBell size={18} />
          {unreadCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[1.45rem] items-center justify-center rounded-full bg-[linear-gradient(135deg,#38bdf8,#0ea5e9)] px-1.5 py-1 text-[10px] font-bold text-white shadow-[0_10px_24px_rgba(14,165,233,0.34)]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      </div>

      {dropdownContent}
    </>
  );
}
