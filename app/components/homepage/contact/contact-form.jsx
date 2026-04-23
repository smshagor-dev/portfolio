"use client";
// @flow strict
import { isValidEmail } from "@/utils/check-email";
import axios from "axios";
import { motion } from "framer-motion";
import { Eye, FileUp, ImageUp, Send, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const inputClass =
  "h-14 w-full rounded-2xl border border-cyan-100/[0.1] bg-slate-950/45 px-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-18px_35px_rgba(15,23,42,0.22)] outline-none transition duration-300 placeholder:text-slate-500 focus:border-cyan-200/45 focus:bg-slate-950/60 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.06)]";

function FieldLabel({ children }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
      {children}
    </label>
  );
}

function UploadField({ id, label, file, accept, inputRef, icon: Icon, onChange }) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <label
        htmlFor={id}
        className="group flex min-h-[96px] cursor-pointer items-center gap-4 rounded-[22px] border border-dashed border-cyan-100/[0.14] bg-slate-950/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-cyan-100/[0.045] hover:shadow-[0_18px_45px_rgba(8,145,178,0.12)]"
      >
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100/10 bg-[linear-gradient(135deg,rgba(103,232,249,0.14),rgba(59,130,246,0.1))] text-cyan-100 transition group-hover:border-cyan-200/30">
          <Icon size={21} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-white">
            {file?.name || `Choose ${label.toLowerCase()}`}
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-400">
            {file ? "Attached successfully" : "Optional upload, saved with your message"}
          </span>
        </span>
        <UploadCloud
          className="ml-auto hidden shrink-0 text-slate-500 transition group-hover:text-cyan-100 sm:block"
          size={18}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={id}
          className="sr-only"
          type="file"
          accept={accept}
          onChange={onChange}
        />
      </label>
    </div>
  );
}

function formatTicketDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString();
}

function ContactForm({ settings }) {
  const [error, setError] = useState({ email: false, required: false });
  const [isLoading, setIsLoading] = useState(false);
  const [ticketSession, setTicketSession] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    photo: null,
    file: null,
  });
  const visibleTickets = ticketHistory.length
    ? ticketHistory
    : ticketSession?.id && ticketSession?.token
      ? [ticketSession]
      : [];

  const checkRequired = () => {
    if (userInput.email && userInput.message && userInput.name && userInput.subject) {
      setError({ ...error, required: false });
    }
  };

  function persistTicketHistory(nextTickets) {
    setTicketHistory(nextTickets);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("portfolio_contact_tickets", JSON.stringify(nextTickets));
    }
  }

  function syncGlobalTicket(ticket, options = {}) {
    if (typeof window === "undefined" || !ticket?.id || !ticket?.token) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("portfolio:ticket-sync", {
        detail: {
          ticket,
          open: Boolean(options.open),
        },
      }),
    );
  }

  function upsertTicketHistory(ticket) {
    if (!ticket?.id || !ticket?.token) {
      return;
    }

    setTicketHistory((current) => {
      const nextTickets = [
        {
          id: ticket.id,
          token: ticket.token,
          subject: ticket.subject || "Conversation",
          createdAt: ticket.createdAt || new Date().toISOString(),
          email: ticket.email || userInput.email,
        },
        ...current.filter((item) => item.id !== ticket.id),
      ];

      if (typeof window !== "undefined") {
        window.localStorage.setItem("portfolio_contact_tickets", JSON.stringify(nextTickets));
      }

      return nextTickets;
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedTicket = window.localStorage.getItem("portfolio_contact_ticket");
      const storedTickets = window.localStorage.getItem("portfolio_contact_tickets");

      if (storedTickets) {
        const parsedTickets = JSON.parse(storedTickets);
        if (Array.isArray(parsedTickets)) {
          setTicketHistory(parsedTickets.filter((item) => item?.id && item?.token));
        }
      }

      if (storedTicket) {
        const parsedTicket = JSON.parse(storedTicket);
        if (parsedTicket?.id && parsedTicket?.token) {
          setTicketSession(parsedTicket);

          if (!storedTickets) {
            persistTicketHistory([
              {
                id: parsedTicket.id,
                token: parsedTicket.token,
                subject: parsedTicket.subject || "Conversation",
                createdAt: parsedTicket.createdAt || new Date().toISOString(),
                email: parsedTicket.email || "",
              },
            ]);
          }
        }
      }
    } catch (_error) {
      // Ignore malformed local ticket state.
    }
  }, []);

  const handleSendMail = async (e) => {
    e.preventDefault();

    if (!userInput.email || !userInput.message || !userInput.name || !userInput.subject) {
      setError({ ...error, required: true });
      return;
    } else if (error.email) {
      return;
    } else {
      setError({ ...error, required: false });
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", userInput.name);
      formData.append("email", userInput.email);
      formData.append("subject", userInput.subject);
      formData.append("message", userInput.message);

      if (userInput.photo) {
        formData.append("photo", userInput.photo);
      }

      if (userInput.file) {
        formData.append("file", userInput.file);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/site/contact`,
        formData,
      );

      toast.success("Message sent successfully!");
      if (response.data?.ticket?.id && response.data?.ticket?.token) {
        const nextTicket = {
          id: response.data.ticket.id,
          token: response.data.ticket.token,
          subject: response.data?.data?.subject || userInput.subject,
          createdAt: response.data?.data?.createdAt || new Date().toISOString(),
          email: response.data?.data?.email || userInput.email,
        };
        setTicketSession(nextTicket);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("portfolio_contact_ticket", JSON.stringify(nextTicket));
        }
        upsertTicketHistory(nextTicket);
        syncGlobalTicket(nextTicket, { open: true });
      }
      setUserInput({
        name: "",
        email: "",
        subject: "",
        message: "",
        photo: null,
        file: null,
      });
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[28px] border border-cyan-100/[0.1] bg-slate-950/45 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:p-6 lg:p-7"
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.6),transparent)]" />
      <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/14" />
      <div className="pointer-events-none absolute -bottom-28 right-8 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
          Contact with {settings?.websiteTitle || "me"}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
          Send a polished project brief
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Tell me what you are building, what matters most, and any helpful files. I will reply with a clear next step.
        </p>

        <form className="mt-7 space-y-5" onSubmit={handleSendMail}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Your Name</FieldLabel>
              <input
                className={inputClass}
                type="text"
                maxLength="100"
                required={true}
                placeholder="Your full name"
                onChange={(e) => setUserInput({ ...userInput, name: e.target.value })}
                onBlur={checkRequired}
                value={userInput.name}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Your Email</FieldLabel>
              <input
                className={inputClass}
                type="email"
                maxLength="100"
                required={true}
                placeholder="you@example.com"
                value={userInput.email}
                onChange={(e) => setUserInput({ ...userInput, email: e.target.value })}
                onBlur={() => {
                  checkRequired();
                  setError({ ...error, email: !isValidEmail(userInput.email) });
                }}
              />
              {error.email ? (
                <p className="text-sm text-red-300">Please provide a valid email.</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Subject</FieldLabel>
            <input
              className={inputClass}
              type="text"
              maxLength="150"
              required={true}
              placeholder="Project inquiry, support, collaboration..."
              onChange={(e) => setUserInput({ ...userInput, subject: e.target.value })}
              onBlur={checkRequired}
              value={userInput.subject}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Your Message</FieldLabel>
            <textarea
              className={`${inputClass} h-auto min-h-[164px] resize-none py-4 leading-7`}
              maxLength="500"
              name="message"
              required={true}
              placeholder="Tell me about the project, timeline, goals, and what success should look like..."
              onChange={(e) => setUserInput({ ...userInput, message: e.target.value })}
              onBlur={checkRequired}
              rows="5"
              value={userInput.message}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <UploadField
              id="contact-photo"
              label="Upload Photo"
              file={userInput.photo}
              accept="image/*"
              inputRef={photoInputRef}
              icon={ImageUp}
              onChange={(e) => setUserInput({ ...userInput, photo: e.target.files?.[0] || null })}
            />
            <UploadField
              id="contact-file"
              label="Upload File"
              file={userInput.file}
              inputRef={fileInputRef}
              icon={FileUp}
              onChange={(e) => setUserInput({ ...userInput, file: e.target.files?.[0] || null })}
            />
          </div>

          <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            {error.required ? (
              <p className="text-sm text-red-300">Name, email, subject, and message are required.</p>
            ) : (
              <p className="text-sm text-slate-400">Usually replies within one business day.</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#7dd3fc_0%,#67e8f9_45%,#86efac_100%)] px-7 py-4 text-sm font-semibold text-slate-950 shadow-[0_18px_44px_rgba(34,211,238,0.22)] transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Sending Message...</span>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send
                    className="transition duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5"
                    size={18}
                    aria-hidden="true"
                  />
                </>
              )}
            </motion.button>
          </div>
        </form>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                Previous Messages
              </p>
              <h4 className="mt-2 text-xl font-semibold text-white">Reopen an older ticket</h4>
            </div>
            <p className="text-sm text-slate-400">Your recent ticket sessions stay available on this device.</p>
          </div>

          <div className="mt-5 space-y-3">
            {visibleTickets.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                No saved tickets on this device yet. After you send a message, it will appear here with a
                `View Chat` button.
              </div>
            ) : (
              visibleTickets.map((item) => (
                <div
                  key={`${item.id}-${item.token}`}
                  className="grid gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{item.subject || "Conversation"}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                      {item.email ? <span>{item.email}</span> : null}
                      {item.email ? <span>•</span> : null}
                      <span>{formatTicketDate(item.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketSession(item);
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem("portfolio_contact_ticket", JSON.stringify(item));
                      }
                      syncGlobalTicket(item, { open: true });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-100/15 bg-cyan-100/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-cyan-100/[0.08]"
                  >
                    <Eye size={15} />
                    View Chat
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ContactForm;
