"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FiClock, FiHome, FiImage, FiMessageSquare, FiPaperclip, FiSend, FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { showChatMessageNotification } from "@/lib/browser-notifications";
import { buildPublicApiUrl, getSocketServerUrl } from "@/lib/public-backend-url";
import { getSocialIconOption } from "@/utils/social-icons";

const socketServerUrl = getSocketServerUrl();

function formatChatTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AttachmentChip({ href, label, icon: Icon, accentClass }) {
  if (!href) {
    return null;
  }

  return (
    <Link
      href={href}
      target="_blank"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${accentClass}`}
    >
      <Icon size={13} />
      {label}
    </Link>
  );
}

function formatTicketDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString();
}

function shouldSubmitOnEnter() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(pointer: fine) and (min-width: 768px)").matches;
}

export default function LiveContactTicket({
  ticketSession,
  isOpen,
  onClose,
  emergencyContacts = [],
  websiteTitle = "Portfolio Website",
  viewMode = "dock",
}) {
  const [activeTicketSession, setActiveTicketSession] = useState(ticketSession || null);
  const [ticket, setTicket] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isCreatingNewTicket, setIsCreatingNewTicket] = useState(false);
  const [isHomeView, setIsHomeView] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [attachments, setAttachments] = useState({ photo: null, file: null });
  const [newTicketInput, setNewTicketInput] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    photo: null,
    file: null,
  });
  const listRef = useRef(null);
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const newTicketPhotoInputRef = useRef(null);
  const newTicketFileInputRef = useRef(null);

  function loadTicketHistory() {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const rawValue = window.localStorage.getItem("portfolio_contact_tickets");
      const parsedValue = rawValue ? JSON.parse(rawValue) : [];
      return Array.isArray(parsedValue) ? parsedValue.filter((item) => item?.id && item?.token) : [];
    } catch (_error) {
      return [];
    }
  }

  function syncCreatedTicket(nextTicket, ticketData) {
    if (typeof window === "undefined" || !nextTicket?.id || !nextTicket?.token) {
      return;
    }

    window.localStorage.setItem("portfolio_contact_ticket", JSON.stringify(nextTicket));
    setActiveTicketSession(nextTicket);

    try {
      const safeTickets = loadTicketHistory();
      const updatedTickets = [
        {
          id: nextTicket.id,
          token: nextTicket.token,
          subject: ticketData?.subject || nextTicket.subject || "Conversation",
          createdAt: ticketData?.createdAt || nextTicket.createdAt || new Date().toISOString(),
          name: ticketData?.name || nextTicket.name || "",
          email: ticketData?.email || nextTicket.email || "",
          status: ticketData?.status || nextTicket.status || "not_solved",
        },
        ...safeTickets.filter((item) => item?.id !== nextTicket.id),
      ];

      window.localStorage.setItem("portfolio_contact_tickets", JSON.stringify(updatedTickets));
      setTicketHistory(updatedTickets);
    } catch (_error) {
      // Ignore malformed stored ticket history.
    }

    window.dispatchEvent(
      new CustomEvent("portfolio:ticket-sync", {
        detail: {
          ticket: {
            ...nextTicket,
            subject: ticketData?.subject || nextTicket.subject || "Conversation",
            createdAt: ticketData?.createdAt || nextTicket.createdAt || new Date().toISOString(),
            name: ticketData?.name || nextTicket.name || "",
            email: ticketData?.email || nextTicket.email || "",
            status: ticketData?.status || nextTicket.status || "not_solved",
          },
          open: true,
        },
      }),
    );
  }

  useEffect(() => {
    if (ticketSession?.id && ticketSession?.token) {
      setActiveTicketSession(ticketSession);
      return;
    }

    if (!ticketSession) {
      setActiveTicketSession(null);
    }
  }, [ticketSession]);

  useEffect(() => {
    if (!activeTicketSession?.id || !activeTicketSession?.token) {
      setTicket(null);
      setIsAssistantTyping(false);
      setIsSocketConnected(false);
      return undefined;
    }

    let isMounted = true;
    const socket = io(socketServerUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setIsSocketConnected(true);
      socket.emit("contact:join", {
        messageId: activeTicketSession.id,
        token: activeTicketSession.token,
      });
    });

    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    async function loadTicket() {
      try {
        const response = await fetch(
          buildPublicApiUrl(`/api/site/contact-ticket/${activeTicketSession.id}?token=${encodeURIComponent(activeTicketSession.token)}`),
          { cache: "no-store" },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load chat.");
        }

        if (isMounted) {
          setTicket(data.ticket || null);
          const updatedHistory = [
            {
              id: data.ticket?.id || activeTicketSession.id,
              token: activeTicketSession.token,
              subject: data.ticket?.subject || "Conversation",
              createdAt: data.ticket?.createdAt || new Date().toISOString(),
              name: data.ticket?.name || activeTicketSession.name || "",
              email: data.ticket?.email || "",
              status: data.ticket?.status || "not_solved",
            },
            ...loadTicketHistory().filter((item) => item?.id !== activeTicketSession.id),
          ];
          setTicketHistory(updatedHistory);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("portfolio_contact_tickets", JSON.stringify(updatedHistory));
          }
        }
      } catch (error) {
        toast.error(error.message || "Failed to load chat.");
      }
    }

    loadTicket();

    socket.on("contact:message_created", (payload) => {
      if (Number(payload?.ticketId) !== Number(activeTicketSession.id) || !payload?.message) {
        return;
      }

      const isVisitorMessage = payload.message.senderType === "visitor";
      if (!isVisitorMessage) {
        setIsAssistantTyping(false);
      }

      if (!isOpen && !isVisitorMessage) {
        setUnreadCount((current) => current + 1);
      }

      if (!isVisitorMessage) {
        showChatMessageNotification({
          audience: "visitor",
          senderName: payload.message.senderName,
          ticketId: activeTicketSession.id,
          ticketToken: activeTicketSession.token,
          message: payload.message.message,
          websiteTitle,
          tag: `visitor-reply-${payload.message.id}`,
        });
      }

      setTicket((current) => {
        if (!current) {
          return current;
        }

        const existing = (current.chatMessages || []).some((item) => item.id === payload.message.id);
        if (existing) {
          return current;
        }

        return {
          ...current,
          chatMessages: [...(current.chatMessages || []), payload.message],
        };
      });
    });

    socket.on("contact:assistant_typing", (payload) => {
      if (Number(payload?.ticketId) !== Number(activeTicketSession.id)) {
        return;
      }

      setIsAssistantTyping(Boolean(payload?.isTyping));
    });

    return () => {
      isMounted = false;
      socket.emit("contact:leave", { messageId: activeTicketSession.id });
      socket.disconnect();
    };
  }, [activeTicketSession, isOpen, websiteTitle]);

  useEffect(() => {
    if (!isOpen || !listRef.current) {
      return;
    }

    setUnreadCount(0);
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [isOpen, ticket?.chatMessages]);

  useEffect(() => {
    setUnreadCount(0);
  }, [activeTicketSession?.id]);

  useEffect(() => {
    setTicketHistory(loadTicketHistory());
  }, [activeTicketSession?.id]);

  useEffect(() => {
    setIsCreatingTicket(false);
    setIsCreatingNewTicket(!activeTicketSession?.id || !activeTicketSession?.token);
    setIsHomeView(false);
    setNewTicketInput({
      name: ticket?.name || "",
      email: ticket?.email || "",
      subject: "",
      message: "",
      photo: null,
      file: null,
    });

    if (newTicketPhotoInputRef.current) {
      newTicketPhotoInputRef.current.value = "";
    }

    if (newTicketFileInputRef.current) {
      newTicketFileInputRef.current.value = "";
    }
  }, [activeTicketSession?.id, activeTicketSession?.token, ticket?.email, ticket?.name]);

  const chatMessages = useMemo(() => ticket?.chatMessages || [], [ticket?.chatMessages]);
  const isClosedTicket = ticket?.status === "solved";
  const isPageView = viewMode === "page";
  const visibleEmergencyContacts = useMemo(
    () =>
      (emergencyContacts || []).filter(
        (item) => item?.label && item?.name && item?.icon && item?.link,
      ),
    [emergencyContacts],
  );

  async function handleSendMessage(event) {
    event.preventDefault();

    if (isClosedTicket) {
      toast.error("This chat is closed. Please start a new chat.");
      return;
    }

    if ((!draft.trim() && !attachments.photo && !attachments.file) || !activeTicketSession?.id || !activeTicketSession?.token) {
      return;
    }

    const messageText = draft.trim();
    const pendingAttachments = attachments;

    try {
      setIsSending(true);
      setIsAssistantTyping(true);
      setDraft("");
      setAttachments({ photo: null, file: null });

      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      const formData = new FormData();
      formData.append("message", messageText);

      if (pendingAttachments.photo) {
        formData.append("photo", pendingAttachments.photo);
      }

      if (pendingAttachments.file) {
        formData.append("file", pendingAttachments.file);
      }

      const response = await fetch(
        buildPublicApiUrl(`/api/site/contact-ticket/${activeTicketSession.id}/messages?token=${encodeURIComponent(activeTicketSession.token)}`),
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reply.");
      }

      setTicket((current) => {
        if (!current || !data.data) {
          return current;
        }

        const nextMessages = [...(current.chatMessages || [])];
        const hasVisitorMessage = nextMessages.some((item) => item.id === data.data.id);
        if (!hasVisitorMessage) {
          nextMessages.push(data.data);
        }

        if (data.assistantReply && !nextMessages.some((item) => item.id === data.assistantReply.id)) {
          nextMessages.push(data.assistantReply);
        }

        return {
          ...current,
          chatMessages: nextMessages,
        };
      });
      setIsAssistantTyping(false);
    } catch (error) {
      setIsAssistantTyping(false);
      setDraft(messageText);
      setAttachments(pendingAttachments);
      toast.error(error.message || "Failed to send reply.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleCreateNewTicket(event) {
    event.preventDefault();

    if (
      !newTicketInput.name.trim() ||
      !newTicketInput.email.trim() ||
      !newTicketInput.subject.trim() ||
      !newTicketInput.message.trim()
    ) {
      toast.error("Name, email, subject, and message are required.");
      return;
    }

    const pendingTicketInput = {
      ...newTicketInput,
      name: newTicketInput.name.trim(),
      email: newTicketInput.email.trim(),
      subject: newTicketInput.subject.trim(),
      message: newTicketInput.message.trim(),
    };

    try {
      setIsCreatingTicket(true);
      setIsAssistantTyping(true);
      setNewTicketInput((current) => ({
        ...current,
        subject: "",
        message: "",
        photo: null,
        file: null,
      }));

      if (newTicketPhotoInputRef.current) {
        newTicketPhotoInputRef.current.value = "";
      }

      if (newTicketFileInputRef.current) {
        newTicketFileInputRef.current.value = "";
      }

      const formData = new FormData();
      formData.append("name", pendingTicketInput.name);
      formData.append("email", pendingTicketInput.email);
      formData.append("subject", pendingTicketInput.subject);
      formData.append("message", pendingTicketInput.message);

      if (pendingTicketInput.photo) {
        formData.append("photo", pendingTicketInput.photo);
      }

      if (pendingTicketInput.file) {
        formData.append("file", pendingTicketInput.file);
      }

      const response = await fetch(buildPublicApiUrl("/api/site/contact"), {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to start chat.");
      }

      const nextTicket = {
        id: data.ticket?.id,
        token: data.ticket?.token,
        subject: data?.data?.subject || pendingTicketInput.subject,
        createdAt: data?.data?.createdAt || new Date().toISOString(),
        name: data?.data?.name || pendingTicketInput.name,
        email: data?.data?.email || pendingTicketInput.email,
      };

      syncCreatedTicket(nextTicket, data?.data);
      setActiveTicketSession(nextTicket);
      setTicket(data?.data || null);
      setIsAssistantTyping(false);
      setDraft("");
      setUnreadCount(0);
      setIsCreatingNewTicket(false);
      setIsHomeView(false);
      setNewTicketInput({
        name: data?.data?.name || pendingTicketInput.name,
        email: data?.data?.email || pendingTicketInput.email,
        subject: "",
        message: "",
        photo: null,
        file: null,
      });

      if (newTicketPhotoInputRef.current) {
        newTicketPhotoInputRef.current.value = "";
      }

      if (newTicketFileInputRef.current) {
        newTicketFileInputRef.current.value = "";
      }

      toast.success("New chat started successfully.");
    } catch (error) {
      setIsAssistantTyping(false);
      setNewTicketInput(pendingTicketInput);
      toast.error(error.message || "Failed to start chat.");
    } finally {
      setIsCreatingTicket(false);
    }
  }

  function handleComposerKeyDown(event, submitCallback) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent?.isComposing) {
      return;
    }

    if (!shouldSubmitOnEnter()) {
      return;
    }

    event.preventDefault();
    submitCallback();
  }

  const hasActiveTicket = Boolean(activeTicketSession?.id && activeTicketSession?.token);
  const showNewTicketView = !hasActiveTicket || isCreatingNewTicket;

  return (
    <>
      {!isOpen && !isPageView ? (
        <button
          type="button"
          onClick={onClose}
          className="group fixed bottom-8 right-5 z-[9999] inline-flex items-center gap-0 rounded-full border border-[#6fd8ff]/55 bg-[linear-gradient(135deg,rgba(8,18,32,0.96),rgba(13,31,52,0.94))] px-2.5 py-2.5 text-left text-white shadow-[0_24px_70px_rgba(2,12,27,0.55),0_0_0_1px_rgba(133,222,255,0.08)] backdrop-blur-2xl ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:border-[#9fe7ff] hover:shadow-[0_30px_85px_rgba(2,12,27,0.62),0_0_0_1px_rgba(133,222,255,0.16)] sm:right-6 sm:gap-2.5 sm:px-3.5"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#8de6ff]/30 bg-[radial-gradient(circle_at_top,rgba(125,240,183,0.28),transparent_55%),linear-gradient(180deg,rgba(17,37,58,0.96),rgba(10,22,36,0.96))] text-[#8fe9ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition group-hover:border-[#b4eeff]/50 group-hover:text-white">
            <FiMessageSquare size={16} />
          </span>
          <span className="hidden min-w-0 flex-1 flex-col justify-center leading-none sm:flex">
            <span className="text-sm font-semibold text-white group-hover:text-[#dcf7ff]">Chat</span>
          </span>
          {unreadCount > 0 ? (
            <span className="inline-flex min-w-[28px] shrink-0 items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(135deg,#7fe0ff,#7cf0b7)] px-2 py-1 text-[11px] font-bold text-[#07111d] shadow-[0_10px_24px_rgba(111,216,255,0.35)]">
              {unreadCount}
            </span>
          ) : null}
        </button>
      ) : null}

      <div
        className={
          isPageView
            ? "flex h-full min-h-0 w-full flex-col"
            : `fixed inset-0 z-[10000] transition duration-300 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[calc(100vw-3rem)] sm:max-w-[440px] ${
                isOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
              }`
        }
      >
        <div
          className={
            isPageView
              ? "h-full min-h-0 overflow-hidden border border-[#6fd8ff]/28 bg-[linear-gradient(180deg,rgba(126,224,255,0.08),rgba(124,240,183,0.03))] p-[1px] shadow-[0_34px_110px_rgba(0,0,0,0.52)] ring-1 ring-white/10 backdrop-blur-2xl rounded-none sm:rounded-[1.9rem]"
              : "h-full overflow-hidden border border-[#6fd8ff]/28 bg-[linear-gradient(180deg,rgba(126,224,255,0.08),rgba(124,240,183,0.03))] p-[1px] shadow-[0_34px_110px_rgba(0,0,0,0.52)] ring-1 ring-white/10 backdrop-blur-2xl sm:h-auto sm:rounded-[1.9rem]"
          }
        >
          <div
            className={
              isPageView
                ? "flex h-full min-h-0 w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(111,216,255,0.12),transparent_28%),linear-gradient(180deg,#0d1829,#09111d)] sm:rounded-[calc(1.9rem-1px)]"
                : "flex h-full min-h-0 w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(111,216,255,0.12),transparent_28%),linear-gradient(180deg,#0d1829,#09111d)] sm:h-[min(88vh,820px)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[calc(1.9rem-1px)]"
            }
          >
            <div className="shrink-0 border-b border-[#86e5ff]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Chat</p>
                  <div className="mt-2 flex items-center gap-2">
                    <h3 className="truncate text-lg font-semibold text-white">{websiteTitle}</h3>
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10"
                      aria-label="Online"
                      title="Online"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.85)]" />
                    </span>
                    {hasActiveTicket && isClosedTicket ? (
                      <span className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200">
                        Closed
                      </span>
                    ) : null}
                    {unreadCount > 0 ? (
                      <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#112237] px-2 py-0.5 text-[11px] font-semibold text-[#8fe3ff]">
                        {unreadCount} new
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHomeView((current) => !current);
                      setIsCreatingNewTicket(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9fdcff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white"
                    aria-label={isHomeView ? "Open chat view" : "Open chat home"}
                    title={isHomeView ? "Chat View" : "Home"}
                  >
                    <FiHome size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHomeView(false);
                      setIsCreatingNewTicket(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9fdcff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white"
                    aria-label="Start new chat"
                    title="New Chat"
                  >
                    <FiMessageSquare size={13} />
                  </button>
                  {!isPageView ? (
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#cfe0f3] transition hover:border-[#70d5ff] hover:text-white"
                    >
                      <FiX size={18} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

          {isHomeView ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[#78d7ff]">Chat Home</p>
                <p className="mt-2 text-sm text-[#93a9c3]">View saved chats and reopen any conversation from this device.</p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {visibleEmergencyContacts.length > 0 ? (
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9fdcff]">
                      Emergency Contact
                    </p>
                    <div className="grid gap-3">
                    {visibleEmergencyContacts.map((item) => {
                      const iconConfig = getSocialIconOption(item.icon);
                      const Icon = iconConfig?.icon || FiSend;

                      return (
                        <Link
                          key={`${item.label}-${item.name}-${item.link}`}
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-[#3e6289]"
                        >
                          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#2d4764] bg-[linear-gradient(135deg,rgba(103,232,249,0.16),rgba(16,185,129,0.1))] text-[#dff7ff]">
                            <Icon size={18} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9fdcff]">
                              {item.label}
                            </span>
                            <span className="mt-1 block truncate text-sm text-white">{item.name}</span>
                          </span>
                        </Link>
                      );
                    })}
                    </div>
                  </div>
                ) : null}

                {ticketHistory.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-[#93a9c3]">
                    <p>you don&apos;t have privious message.</p>
                  </div>
                ) : (
                  ticketHistory.map((item) => {
                    const isSelected = Number(item.id) === Number(activeTicketSession?.id);
                    const isClosed = item.status === "solved";

                    return (
                      <button
                        key={`${item.id}-${item.token}`}
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("portfolio:ticket-sync", {
                              detail: {
                                ticket: item,
                                open: true,
                              },
                            }),
                          );
                          setActiveTicketSession(item);
                          setIsHomeView(false);
                        }}
                        className={`w-full rounded-[1.2rem] border p-4 text-left transition ${
                          isSelected
                            ? "border-[#70d5ff] bg-[#0b1829]"
                            : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-[#3e6289]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{item.subject || "Conversation"}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#8ea7c2]">
                              <span className="inline-flex items-center gap-1">
                                <FiClock size={12} />
                                {formatTicketDate(item.createdAt)}
                              </span>
                              <span>{websiteTitle}</span>
                            </div>
                          </div>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                              isClosed
                                ? "border border-amber-400/25 bg-amber-400/10 text-amber-200"
                                : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                            }`}
                          >
                            {isClosed ? "Closed" : "Open"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : showNewTicketView ? (
            <form onSubmit={handleCreateNewTicket} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-4 py-4 sm:px-4 sm:py-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">Name</label>
                  <input
                    value={newTicketInput.name}
                    onChange={(event) => setNewTicketInput((current) => ({ ...current, name: event.target.value }))}
                    className="h-12 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff]"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">Email</label>
                  <input
                    type="email"
                    value={newTicketInput.email}
                    onChange={(event) => setNewTicketInput((current) => ({ ...current, email: event.target.value }))}
                    className="h-12 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff]"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">Subject</label>
                  <input
                    value={newTicketInput.subject}
                    onChange={(event) => setNewTicketInput((current) => ({ ...current, subject: event.target.value }))}
                    className="h-12 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff]"
                    placeholder="New project or support subject"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">Message</label>
                  <textarea
                    value={newTicketInput.message}
                    onChange={(event) => setNewTicketInput((current) => ({ ...current, message: event.target.value }))}
                    onKeyDown={(event) => handleComposerKeyDown(event, () => handleCreateNewTicket(event))}
                    rows={5}
                    className="min-h-[110px] w-full resize-none rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff] sm:min-h-[140px]"
                    placeholder="Describe your new request..."
                  />
                </div>
              </div>

              <div className="shrink-0 border-t border-white/10 bg-[linear-gradient(180deg,rgba(9,17,29,0.72),rgba(9,17,29,0.98))] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => newTicketPhotoInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9fdcff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white"
                  >
                    <FiImage size={14} />
                    {newTicketInput.photo ? "Change Photo" : "Add Photo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => newTicketFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9fdcff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white"
                  >
                    <FiPaperclip size={14} />
                    {newTicketInput.file ? "Change File" : "Add File"}
                  </button>
                  <input
                    ref={newTicketPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      setNewTicketInput((current) => ({
                        ...current,
                        photo: event.target.files?.[0] || null,
                      }))
                    }
                  />
                  <input
                    ref={newTicketFileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(event) =>
                      setNewTicketInput((current) => ({
                        ...current,
                        file: event.target.files?.[0] || null,
                      }))
                    }
                  />
                </div>

                {newTicketInput.photo || newTicketInput.file ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {newTicketInput.photo ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-[#081322] px-3 py-1.5 text-xs text-[#cfe0f3]">
                        <FiUpload size={12} />
                        {newTicketInput.photo.name}
                      </span>
                    ) : null}
                    {newTicketInput.file ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-[#081322] px-3 py-1.5 text-xs text-[#cfe0f3]">
                        <FiUpload size={12} />
                        {newTicketInput.file.name}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex items-end gap-3">
                  <button
                    type="submit"
                    disabled={isCreatingTicket}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 text-sm font-semibold text-[#07111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiSend size={16} />
                    {isCreatingTicket ? "Starting..." : "Start Chat"}
                  </button>
                </div>
              </div>
            </form>
          ) : hasActiveTicket ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div ref={listRef} className="flex-1 min-h-0 space-y-3 overflow-y-auto px-4 py-4">
                {chatMessages.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-[#93a9c3]">
                    Your full chat history will appear here.
                  </div>
                ) : (
                  chatMessages.map((message) => {
                    const isVisitor = message.senderType === "visitor";
                    const bubbleAttachmentClass = isVisitor
                      ? "border-[#153043]/15 bg-[#07111d]/10 text-[#153043] hover:border-[#153043]/35 hover:bg-[#07111d]/15"
                      : "border-white/10 bg-white/[0.03] text-[#9fdcff] hover:border-[#70d5ff] hover:text-white";

                    return (
                      <div key={message.id} className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm shadow-[0_12px_30px_rgba(0,0,0,0.18)] ${
                            isVisitor
                              ? "bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] text-[#07111d]"
                              : "border border-white/10 bg-white/[0.05] text-white"
                          }`}
                        >
                          {message.message ? <p className="whitespace-pre-wrap leading-6">{message.message}</p> : null}

                          {message.photo || message.file ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <AttachmentChip
                                href={message.photo}
                                label="View Photo"
                                icon={FiImage}
                                accentClass={bubbleAttachmentClass}
                              />
                              <AttachmentChip
                                href={message.file}
                                label="Open File"
                                icon={FiPaperclip}
                                accentClass={bubbleAttachmentClass}
                              />
                            </div>
                          ) : null}

                          <p className={`mt-2 text-[11px] ${isVisitor ? "text-[#153043]" : "text-[#93a9c3]"}`}>
                            {isVisitor ? (message.senderName || "You") : "Shagor Assistant"} - {formatChatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {isAssistantTyping ? (
                  <div className="flex justify-start">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                      <p className="text-[11px] text-[#93a9c3]">Shagor Assistant</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#70d5ff] [animation-delay:-0.2s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#70d5ff] [animation-delay:-0.1s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#70d5ff]" />
                        <span className="ml-1 text-[#b8deff]">Typing...</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <form onSubmit={handleSendMessage} className="shrink-0 border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {isClosedTicket ? (
                  <div className="mb-3 rounded-[1rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                    This chat is closed. You can view the conversation, but sending new messages is disabled.
                  </div>
                ) : null}
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isClosedTicket}
                    className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9fdcff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white"
                  >
                    <FiImage size={14} />
                    {attachments.photo ? "Change Photo" : "Add Photo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isClosedTicket}
                    className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9fdcff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white"
                  >
                    <FiPaperclip size={14} />
                    {attachments.file ? "Change File" : "Add File"}
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      setAttachments((current) => ({
                        ...current,
                        photo: event.target.files?.[0] || null,
                      }))
                    }
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(event) =>
                      setAttachments((current) => ({
                        ...current,
                        file: event.target.files?.[0] || null,
                      }))
                    }
                  />
                </div>

                {attachments.photo || attachments.file ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.photo ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-[#081322] px-3 py-1.5 text-xs text-[#cfe0f3]">
                        <FiUpload size={12} />
                        {attachments.photo.name}
                      </span>
                    ) : null}
                    {attachments.file ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-[#081322] px-3 py-1.5 text-xs text-[#cfe0f3]">
                        <FiUpload size={12} />
                        {attachments.file.name}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex items-end gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => handleComposerKeyDown(event, () => handleSendMessage(event))}
                    rows={2}
                    placeholder={isClosedTicket ? "This chat is closed" : "Write your message..."}
                    disabled={isClosedTicket}
                    className="min-h-[56px] flex-1 resize-none rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isClosedTicket || isSending || (!draft.trim() && !attachments.photo && !attachments.file)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] text-[#07111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiSend size={17} />
                  </button>
                </div>
              </form>
            </div>
          ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
