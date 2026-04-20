"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "support@smshagor.com",
    password: "SmShagor1@1",
  });

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsLoading(true);
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("portfolio_admin_token", data.token);
      localStorage.setItem("portfolio_admin_user", JSON.stringify(data.admin));
      toast.success("Admin login successful.");
      router.push("/admin");
    } catch (error) {
      toast.error(error.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#2a2e5a] bg-[#10172d] p-6 shadow-[0_0_30px_rgba(0,0,0,0.25)]">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#16f2b3]">
          Admin Access
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-[#d3d8e8]">Email</label>
            <input
              className="w-full rounded-lg border border-[#353a52] bg-[#0b1120] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#d3d8e8]">Password</label>
            <input
              className="w-full rounded-lg border border-[#353a52] bg-[#0b1120] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
          </div>
          <button
            className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
