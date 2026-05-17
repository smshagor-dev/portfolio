"use client";

import { ToastContainer } from "react-toastify";

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      newestOnTop
      closeOnClick={false}
      draggable={false}
      pauseOnFocusLoss={false}
      className="!z-[120]"
      toastClassName={() => "!bg-transparent !shadow-none !p-0 !min-h-0"}
      bodyClassName={() => "!p-0"}
      style={{
        top: "1rem",
        right: "1rem",
        width: "min(340px, calc(100vw - 1.5rem))",
      }}
    />
  );
}
