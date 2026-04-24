"use client";

const OPEN_CHAT_SIGNAL_KEY = "portfolio_force_open_chat";

export default function OpenChatButton({ className = "", children = "Chat Now" }) {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          window.localStorage.setItem(OPEN_CHAT_SIGNAL_KEY, String(Date.now()));
        } catch (_error) {
          // Ignore storage write issues and still try the in-memory event path.
        }

        window.dispatchEvent(new CustomEvent("portfolio:open-chat"));
      }}
      className={className}
    >
      {children}
    </button>
  );
}
