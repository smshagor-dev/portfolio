"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { buildPublicApiUrl, getSocketServerUrl } from "@/lib/public-backend-url";

const socketServerUrl = getSocketServerUrl();

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function buildEmptyReplyForm() {
  return {
    name: "",
    reply: "",
  };
}

function createStatus(type = "", message = "") {
  return { type, message };
}

function FeedbackCard({ comment, children }) {
  return (
    <article className="rounded-[1.75rem] border border-[#24344d] bg-[linear-gradient(180deg,#0f1a2c,#0a1321)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-base font-semibold text-white">{comment.name || "Anonymous"}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[#7adab5]">Project discussion</p>
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#88a0ba]">{formatDate(comment.createdAt)}</p>
        </div>
        <p className="mt-4 text-sm leading-7 text-[#c4d0dd]">{comment.comment}</p>
      </div>
      {children}
    </article>
  );
}

export default function ProjectCommentsPanel({ projectSlug, comments = [] }) {
  const [items, setItems] = useState(comments);
  const [form, setForm] = useState({
    name: "",
    comment: "",
  });
  const [replyForms, setReplyForms] = useState({});
  const [status, setStatus] = useState(createStatus());
  const [replyStatus, setReplyStatus] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openReplyEditorId, setOpenReplyEditorId] = useState(null);
  const [isCommentEditorOpen, setIsCommentEditorOpen] = useState(false);

  const totalReplies = useMemo(
    () => items.reduce((sum, item) => sum + (item.replies?.length || 0), 0),
    [items],
  );

  useEffect(() => {
    const socket = io(socketServerUrl, {
      transports: ["websocket", "polling"],
    });

    socket.emit("project:join", projectSlug);

    socket.on("project:comment_created", (payload) => {
      if (payload?.projectSlug !== projectSlug || !payload.comment) {
        return;
      }

      setItems((current) => {
        if (current.some((item) => item.id === payload.comment.id)) {
          return current;
        }

        return [...current, payload.comment];
      });
    });

    socket.on("project:reply_created", (payload) => {
      if (payload?.projectSlug !== projectSlug || !payload.reply) {
        return;
      }

      setItems((current) =>
        current.map((item) => {
          if (item.id !== payload.commentId) {
            return item;
          }

          if ((item.replies || []).some((reply) => reply.id === payload.reply.id)) {
            return item;
          }

          return {
            ...item,
            replies: [...(item.replies || []), payload.reply],
          };
        }),
      );
    });

    return () => {
      socket.emit("project:leave", projectSlug);
      socket.disconnect();
    };
  }, [projectSlug]);

  function updateReplyForm(commentId, changes) {
    setReplyForms((current) => ({
      ...current,
      [commentId]: {
        ...(current[commentId] || buildEmptyReplyForm()),
        ...changes,
      },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.comment.trim()) {
      setStatus(createStatus("error", "Name and comment are required."));
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus(createStatus());

      const response = await fetch(
        buildPublicApiUrl(`/api/site/projects/${encodeURIComponent(projectSlug)}/comments`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            comment: form.comment.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit comment.");
      }

      setForm({
        name: "",
        comment: "",
      });
      setIsCommentEditorOpen(false);
      setStatus(createStatus("success", "Your comment has been published."));
      setItems((current) => {
        if (current.some((item) => item.id === data.comment.id)) {
          return current;
        }

        return [...current, data.comment];
      });
    } catch (error) {
      setStatus(createStatus("error", error.message || "Failed to submit comment."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReplySubmit(event, commentId) {
    event.preventDefault();

    const activeReplyForm = replyForms[commentId] || buildEmptyReplyForm();
    const replyText = activeReplyForm.reply?.trim();
    const replyName = activeReplyForm.name?.trim();

    if (!replyName || !replyText) {
      setReplyStatus((current) => ({
        ...current,
        [commentId]: createStatus("error", "Name and reply are required."),
      }));
      return;
    }

    try {
      setReplyStatus((current) => ({
        ...current,
        [commentId]: createStatus(),
      }));

      const response = await fetch(
        buildPublicApiUrl(`/api/site/projects/${encodeURIComponent(projectSlug)}/comments/${commentId}/replies`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: replyName,
            reply: replyText,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit reply.");
      }

      setItems((current) =>
        current.map((item) => {
          if (item.id !== commentId) {
            return item;
          }

          if ((item.replies || []).some((reply) => reply.id === data.reply.id)) {
            return item;
          }

          return {
            ...item,
            replies: [...(item.replies || []), data.reply],
          };
        }),
      );

      setReplyForms((current) => ({
        ...current,
        [commentId]: buildEmptyReplyForm(),
      }));
      setOpenReplyEditorId(null);
      setReplyStatus((current) => ({
        ...current,
        [commentId]: createStatus("success", "Reply published successfully."),
      }));
    } catch (error) {
      setReplyStatus((current) => ({
        ...current,
        [commentId]: createStatus("error", error.message || "Failed to submit reply."),
      }));
    }
  }

  return (
    <section className="mt-14 rounded-[2rem] border border-[#203049] bg-[linear-gradient(180deg,rgba(11,18,31,0.92),rgba(8,13,23,0.98))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.22)] md:p-8">
      <div className="flex flex-col gap-4 border-b border-[#1d2d42] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#79d4ff]">Project Discussion</p>
          <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Comments and replies</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-[#29405d] bg-[#0e1829] px-4 py-3 text-sm text-[#d7e3f1]">
            {items.length} comment{items.length === 1 ? "" : "s"}
          </div>
          <div className="rounded-2xl border border-[#2b4f44] bg-[#0d1d19] px-4 py-3 text-sm text-[#a6eed0]">
            {totalReplies} repl{totalReplies === 1 ? "y" : "ies"}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-5">
          {items.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#29405d] bg-[#0d1829] p-5 text-sm text-[#9fb1c7]">
              No comments added yet. Be the first person to share feedback on this project.
            </div>
          ) : (
            items.map((comment) => {
              const activeReplyForm = replyForms[comment.id] || buildEmptyReplyForm();
              const activeReplyStatus = replyStatus[comment.id];

              return (
                <FeedbackCard key={comment.id} comment={comment}>
                  {(comment.replies || []).length > 0 ? (
                    <div className="mt-5 space-y-3 border-t border-[#1f2d43] pt-5">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-[1.25rem] border border-[#263753] bg-[#0b1422] px-4 py-4"
                        >
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm font-semibold text-[#dfeaf7]">{reply.name || "Reply"}</p>
                            <p className="text-[11px] uppercase tracking-[0.24em] text-[#88a0ba]">
                              {formatDate(reply.createdAt)}
                            </p>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-[#c4d0dd]">{reply.reply}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 border-t border-[#1f2d43] pt-5">
                    <button
                      type="button"
                      onClick={() => setOpenReplyEditorId((current) => (current === comment.id ? null : comment.id))}
                      className="inline-flex items-center rounded-full border border-[#35516f] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
                    >
                      {openReplyEditorId === comment.id ? "Close reply" : "Reply to comment"}
                    </button>

                    {openReplyEditorId === comment.id ? (
                      <form className="mt-4" onSubmit={(event) => handleReplySubmit(event, comment.id)}>
                        <input
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-white outline-none transition focus:border-[#49c1ff]"
                          value={activeReplyForm.name}
                          onChange={(event) => updateReplyForm(comment.id, { name: event.target.value })}
                          placeholder="Your name"
                        />

                        <textarea
                          className="mt-3 min-h-[120px] w-full rounded-[1.25rem] border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-white outline-none transition focus:border-[#49c1ff]"
                          value={activeReplyForm.reply}
                          onChange={(event) => updateReplyForm(comment.id, { reply: event.target.value })}
                          placeholder="Write a thoughtful reply..."
                        />

                        {activeReplyStatus?.message ? (
                          <div
                            className={`mt-3 rounded-xl border px-4 py-3 text-sm ${
                              activeReplyStatus.type === "success"
                                ? "border-[#2f624d] bg-[#10241c] text-[#9ff1c8]"
                                : "border-[#6a3440] bg-[#251118] text-[#ffc3cf]"
                            }`}
                          >
                            {activeReplyStatus.message}
                          </div>
                        ) : null}

                        <button
                          type="submit"
                          className="mt-4 inline-flex items-center rounded-full border border-[#35516f] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
                        >
                          Publish reply
                        </button>
                      </form>
                    ) : null}
                  </div>
                </FeedbackCard>
              );
            })
          )}
        </div>

        <div className="h-fit rounded-[1.75rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-5 xl:sticky xl:top-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#70d5ff]">Leave a Comment</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Share your thoughts</h3>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsCommentEditorOpen((current) => !current)}
              className="inline-flex items-center rounded-full border border-[#35516f] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
            >
              {isCommentEditorOpen ? "Close comment" : "Write a comment"}
            </button>

            {isCommentEditorOpen ? (
              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Your name</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Comment</label>
                  <textarea
                    className="min-h-[180px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.comment}
                    onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                    placeholder="Write your thoughts about this project..."
                  />
                </div>

                {status.message ? (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      status.type === "success"
                        ? "border-[#2f624d] bg-[#10241c] text-[#9ff1c8]"
                        : "border-[#6a3440] bg-[#251118] text-[#ffc3cf]"
                    }`}
                  >
                    {status.message}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-5 py-3 text-sm font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Publishing..." : "Publish Comment"}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
