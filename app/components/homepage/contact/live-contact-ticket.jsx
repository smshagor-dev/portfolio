"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FiClock, FiHome, FiImage, FiMessageSquare, FiPaperclip, FiPlusSquare, FiSend, FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

export default function LiveContactTicket({ ticketSession, isOpen, onClose }) {
  const [ticket, setTicket] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isCreatingNewTicket, setIsCreatingNewTicket] = useState(false);
  const [isHomeView, setIsHomeView] = useState(false);
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

    try {
      const safeTickets = loadTicketHistory();
      const updatedTickets = [
        {
          id: nextTicket.id,
          token: nextTicket.token,
          subject: ticketData?.subject || nextTicket.subject || "Conversation",
          createdAt: ticketData?.createdAt || nextTicket.createdAt || new Date().toISOString(),
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
            email: ticketData?.email || nextTicket.email || "",
            status: ticketData?.status || nextTicket.status || "not_solved",
          },
          open: true,
        },
      }),
    );
  }

  useEffect(() => {
    if (!ticketSession?.id || !ticketSession?.token) {
      setTicket(null);
      return undefined;
    }

    let isMounted = true;
    const socket = io(backendUrl, {
      transports: ["websocket", "polling"],
    });

    async function loadTicket() {
      try {
        const response = await fetch(
          `${backendUrl}/api/site/contact-ticket/${ticketSession.id}?token=${encodeURIComponent(ticketSession.token)}`,
          { cache: "no-store" },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load ticket.");
        }

        if (isMounted) {
          setTicket(data.ticket || null);
          const updatedHistory = [
            {
              id: data.ticket?.id || ticketSession.id,
              token: ticketSession.token,
              subject: data.ticket?.subject || "Conversation",
              createdAt: data.ticket?.createdAt || new Date().toISOString(),
              email: data.ticket?.email || "",
              status: data.ticket?.status || "not_solved",
            },
            ...loadTicketHistory().filter((item) => item?.id !== ticketSession.id),
          ];
          setTicketHistory(updatedHistory);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("portfolio_contact_tickets", JSON.stringify(updatedHistory));
          }
        }
      } catch (error) {
        toast.error(error.message || "Failed to load ticket.");
      }
    }

    loadTicket();
    socket.emit("contact:join", {
      messageId: ticketSession.id,
      token: ticketSession.token,
    });

    socket.on("contact:message_created", (payload) => {
      if (Number(payload?.ticketId) !== Number(ticketSession.id) || !payload?.message) {
        return;
      }

      if (!isOpen && payload.message.senderType !== "visitor") {
        setUnreadCount((current) => current + 1);
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

    return () => {
      isMounted = false;
      socket.emit("contact:leave", { messageId: ticketSession.id });
      socket.disconnect();
    };
  }, [isOpen, ticketSession]);

  useEffect(() => {
    if (!isOpen || !listRef.current) {
      return;
    }

    setUnreadCount(0);
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [isOpen, ticket?.chatMessages]);

  useEffect(() => {
    setUnreadCount(0);
  }, [ticketSession?.id]);

  useEffect(() => {
    setTicketHistory(loadTicketHistory());
  }, [ticketSession?.id]);

  useEffect(() => {
    setIsCreatingTicket(false);
    setIsCreatingNewTicket(false);
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
  }, [ticket?.email, ticket?.name, ticketSession?.id]);

  const chatMessages = useMemo(() => ticket?.chatMessages || [], [ticket?.chatMessages]);
  const isClosedTicket = ticket?.status === "solved";

  async function handleSendMessage(event) {
    event.preventDefault();

    if (isClosedTicket) {
      toast.error("This ticket is closed. Please create a new ticket.");
      return;
    }

    if ((!draft.trim() && !attachments.photo && !attachments.file) || !ticketSession?.id || !ticketSession?.token) {
      return;
    }

    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append("message", draft.trim());

      if (attachments.photo) {
        formData.append("photo", attachments.photo);
      }

      if (attachments.file) {
        formData.append("file", attachments.file);
      }

      const response = await fetch(
        `${backendUrl}/api/site/contact-ticket/${ticketSession.id}/messages?token=${encodeURIComponent(ticketSession.token)}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reply.");
      }

      setDraft("");
      setAttachments({ photo: null, file: null });

      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTicket((current) => {
        if (!current || !data.data) {
          return current;
        }

        const exists = (current.chatMessages || []).some((item) => item.id === data.data.id);
        if (exists) {
          return current;
        }

        return {
          ...current,
          chatMessages: [...(current.chatMessages || []), data.data],
        };
      });
    } catch (error) {
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

    try {
      setIsCreatingTicket(true);
      const formData = new FormData();
      formData.append("name", newTicketInput.name.trim());
      formData.append("email", newTicketInput.email.trim());
      formData.append("subject", newTicketInput.subject.trim());
      formData.append("message", newTicketInput.message.trim());

      if (newTicketInput.photo) {
        formData.append("photo", newTicketInput.photo);
      }

      if (newTicketInput.file) {
        formData.append("file", newTicketInput.file);
      }

      const response = await fetch(`${backendUrl}/api/site/contact`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create ticket.");
      }

      const nextTicket = {
        id: data.ticket?.id,
        token: data.ticket?.token,
        subject: data?.data?.subject || newTicketInput.subject.trim(),
        createdAt: data?.data?.createdAt || new Date().toISOString(),
        email: data?.data?.email || newTicketInput.email.trim(),
      };

      syncCreatedTicket(nextTicket, data?.data);
      setTicket(data?.data || null);
      setDraft("");
      setUnreadCount(0);
      setIsCreatingNewTicket(false);
      setIsHomeView(false);
      setNewTicketInput({
        name: data?.data?.name || newTicketInput.name.trim(),
        email: data?.data?.email || newTicketInput.email.trim(),
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

      toast.success("New ticket created successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to create ticket.");
    } finally {
      setIsCreatingTicket(false);
    }
  }

  if (!ticketSession?.id || !ticketSession?.token) {
    return null;
  }

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed bottom-8 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-[#70d5ff]/30 bg-[#091524]/90 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-[#70d5ff]"
        >
          <FiMessageSquare size={17} />
          Open Ticket
          {unreadCount > 0 ? (
            <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-1.5 py-0.5 text-[11px] font-bold text-[#07111d]">
              {unreadCount}
            </span>
          ) : null}
        </button>
      ) : null}

      <div
        className={`fixed bottom-6 right-4 z-50 w-[calc(100vw-2rem)] max-w-[440px] transition duration-300 sm:right-6 ${
          isOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <div className="flex h-[min(80vh,720px)] w-full max-w-[440px] flex-col overflow-hidden rounded-[1.8rem] border border-[#27405c] bg-[linear-gradient(180deg,#0f1c31,#09111d)] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Live Ticket</p>
              <div className="mt-2 flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{ticket?.subject || "Conversation"}</h3>
                {isClosedTicket ? (
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsHomeView((current) => !current);
                  setIsCreatingNewTicket(false);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9fdcff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white"
                aria-label={isHomeView ? "Open chat view" : "Open ticket home"}
                title={isHomeView ? "Chat View" : "Home"}
              >
                <FiHome size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNewTicket((current) => !current);
                  setIsHomeView(false);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#2d4764] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9fdcff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white"
              >
                <FiPlusSquare size={13} />
                {isCreatingNewTicket ? "Back To Chat" : "New Ticket"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#cfe0f3] transition hover:border-[#70d5ff] hover:text-white"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {isHomeView ? (
            <div className="flex flex-1 flex-col">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[#78d7ff]">Ticket Home</p>
                <p className="mt-2 text-sm text-[#93a9c3]">View saved tickets and reopen any conversation from this device.</p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {ticketHistory.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-[#93a9c3]">
                    No saved tickets yet. Start a new ticket to begin a conversation.
                  </div>
                ) : (
                  ticketHistory.map((item) => {
                    const isSelected = Number(item.id) === Number(ticketSession?.id);
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
                              {item.email ? <span>{item.email}</span> : null}
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
          ) : isCreatingNewTicket ? (
            <form onSubmit={handleCreateNewTicket} className="flex flex-1 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                

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
                    rows={5}
                    className="min-h-[140px] w-full resize-none rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff]"
                    placeholder="Describe your new request..."
                  />
                </div>
              </div>

              <div className="border-t border-white/10 p-4">
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
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 text-sm font-semibold text-[#07111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiSend size={16} />
                    {isCreatingTicket ? "Creating..." : "Create Ticket"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {chatMessages.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-[#93a9c3]">
                    Waiting for conversation history...
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
                          {message.message ? <p className="leading-6">{message.message}</p> : null}

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
                            {message.senderName || (isVisitor ? "You" : "Admin")} - {formatChatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4">
                {isClosedTicket ? (
                  <div className="mb-3 rounded-[1rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                    This ticket is closed. You can view the conversation, but sending new messages is disabled.
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
                    rows={2}
                    placeholder={isClosedTicket ? "This ticket is closed" : "Write a reply..."}
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
