"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FiSave } from "react-icons/fi";
import AdminFixedSidebarShell from "@/app/components/admin/admin-fixed-sidebar-shell";
import { buildPublicApiUrl } from "@/lib/public-backend-url";

const RichTextEditor = dynamic(() => import("@/app/components/admin/rich-text-editor"), {
  ssr: false,
});

export default function AdminPrivacyPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    privacyPolicyHtml: "",
    termsConditionsHtml: "",
  });

  const adminRequest = useCallback(async (pathname, init = {}, authToken = token) => {
    const response = await fetch(buildPublicApiUrl(pathname), {
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        ...(init.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem("portfolio_admin_token");
      localStorage.removeItem("portfolio_admin_user");
      router.replace("/login/admin");
      throw new Error("Admin session expired.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }, [router, token]);

  useEffect(() => {
    const savedToken = localStorage.getItem("portfolio_admin_token");
    if (!savedToken) {
      router.replace("/login/admin");
      return;
    }

    setToken(savedToken);
    setLoading(true);
    adminRequest("/api/admin/legal-pages", {}, savedToken)
      .then((data) => {
        setForm({
          privacyPolicyHtml: data.privacyPolicyHtml || "",
          termsConditionsHtml: data.termsConditionsHtml || "",
        });
      })
      .catch((error) => toast.error(error.message || "Failed to load legal pages."))
      .finally(() => setLoading(false));
  }, [adminRequest, router]);

  async function saveLegalPages(event) {
    event.preventDefault();
    try {
      setSaving(true);
      const data = await adminRequest("/api/admin/legal-pages", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      toast.success(data.message || "Legal pages saved.");
    } catch (error) {
      toast.error(error.message || "Failed to save legal pages.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminFixedSidebarShell title="Privacy & Terms" description="Edit public legal pages shown in the website footer.">
      <form onSubmit={saveLegalPages} className="space-y-6">
        <section className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,26,42,0.94),rgba(11,20,34,0.92))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#78d7ff]">Legal Content</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Privacy Policy and Terms</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#9fb1c7]">
                These pages appear in the public footer. Use clear, accurate content for your visitors.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || saving}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] disabled:opacity-60"
            >
              <FiSave size={15} /> {saving ? "Saving..." : "Save Legal Pages"}
            </button>
          </div>
        </section>

        {loading ? (
          <div className="rounded-[1.2rem] border border-white/10 bg-[#08111d]/80 p-5 text-sm text-[#9fb1c7]">Loading legal pages...</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
              <h2 className="text-xl font-semibold text-white">Privacy Policy</h2>
              <p className="mt-2 text-sm text-[#9fb1c7]">Explain data collection, contact messages, analytics, cookies, and user rights.</p>
              <div className="mt-5">
                <RichTextEditor
                  id="privacy-policy-editor"
                  label="Privacy Policy Content"
                  value={form.privacyPolicyHtml}
                  onChange={(value) => setForm((current) => ({ ...current, privacyPolicyHtml: value }))}
                  uploadToken={token}
                />
              </div>
            </section>

            <section className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
              <h2 className="text-xl font-semibold text-white">Terms and Conditions</h2>
              <p className="mt-2 text-sm text-[#9fb1c7]">Explain website use, portfolio content, service information, limitations, and contact terms.</p>
              <div className="mt-5">
                <RichTextEditor
                  id="terms-conditions-editor"
                  label="Terms and Conditions Content"
                  value={form.termsConditionsHtml}
                  onChange={(value) => setForm((current) => ({ ...current, termsConditionsHtml: value }))}
                  uploadToken={token}
                />
              </div>
            </section>
          </div>
        )}
      </form>
    </AdminFixedSidebarShell>
  );
}
