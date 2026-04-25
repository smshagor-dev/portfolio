"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { buildPublicApiUrl } from "@/lib/public-backend-url";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Email and password are required.");
      return;
    }

    if (requiresTwoFactor && !form.twoFactorCode.trim()) {
      toast.error("Enter your 2FA code.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(buildPublicApiUrl("/api/admin/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        toast.info(data.message || "Enter your 2FA code to continue.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("portfolio_admin_token", data.token);
      localStorage.setItem("portfolio_admin_user", JSON.stringify(data.admin));
      setRequiresTwoFactor(false);
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
              onChange={(event) => {
                setRequiresTwoFactor(false);
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                  twoFactorCode: "",
                }));
              }}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#d3d8e8]">Password</label>
            <input
              className="w-full rounded-lg border border-[#353a52] bg-[#0b1120] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
              type="password"
              value={form.password}
              onChange={(event) => {
                setRequiresTwoFactor(false);
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                  twoFactorCode: "",
                }));
              }}
            />
          </div>
          {requiresTwoFactor && (
            <div>
              <label className="mb-2 block text-sm text-[#d3d8e8]">2FA Code</label>
              <input
                className="w-full rounded-lg border border-[#353a52] bg-[#0b1120] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={form.twoFactorCode}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    twoFactorCode: event.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
              />
            </div>
          )}
          <button
            className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : requiresTwoFactor ? "Verify & Login" : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
