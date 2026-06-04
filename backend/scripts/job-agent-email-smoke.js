require("../lib/config");

const prisma = require("../lib/prisma");
const { signAdminToken } = require("../lib/auth");

async function main() {
  const token = signAdminToken({ id: 1, email: "admin@example.com" });
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const base = "http://127.0.0.1:5000";

  async function request(pathname, options = {}) {
    const response = await fetch(`${base}${pathname}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(`${pathname} ${response.status}: ${data.message || text}`);
    }

    return data;
  }

  const saved = await request("/api/admin/job-agent/email/settings", {
    method: "PUT",
    body: JSON.stringify({
      fromName: "Job Agent",
      fromEmail: "agent@example.com",
      smtpUsername: "agent@example.com",
      smtpPassword: "fake-app-password",
      smtpPort: 465,
      smtpSecure: true,
      dailySendLimit: 1,
      isEnabled: true,
      openTrackingEnabled: true,
      clickTrackingEnabled: true,
    }),
  });

  if (saved.setting.smtpPassword || saved.setting.smtpPasswordEncrypted || !saved.setting.hasPassword) {
    throw new Error("SMTP password serialization is unsafe.");
  }

  const loaded = await request("/api/admin/job-agent/email/settings");
  if (loaded.setting.smtpPassword || loaded.setting.smtpPasswordEncrypted) {
    throw new Error("SMTP password leaked in settings response.");
  }

  await request("/api/admin/job-agent/email/test", {
    method: "POST",
    body: JSON.stringify({ mock: true, toEmail: "agent@example.com" }),
  });

  const previousAiSetting = await prisma.jobAgentAiSetting.findUnique({ where: { id: 1 } });
  await prisma.jobAgentAiSetting.update({
    where: { id: 1 },
    data: { requireAdminApproval: false },
  });

  const job = await prisma.jobPost.create({
    data: {
      sourceType: "manual",
      title: "Smoke Email Job",
      company: "Smoke Co",
      location: "Remote",
      sourceUrl: "",
      description: "Node role",
      rawContent: "Node role",
      status: "new",
    },
  });
  const contact = await prisma.recruiterContact.create({
    data: {
      jobPostId: job.id,
      email: "recruiter@example.com",
      source: "manual",
      verification: "manual",
      verified: true,
      publicContext: "smoke",
    },
  });
  const draft = await prisma.jobEmailDraft.create({
    data: {
      jobPostId: job.id,
      recruiterContactId: contact.id,
      toEmail: contact.email,
      subject: "Smoke",
      body: "Hello https://example.com",
      aiProvider: "DEEPSEEK",
      aiModel: "deepseek-chat",
      emailPromptUsed: "smoke email prompt",
      coverLetterPromptUsed: "smoke cover letter prompt",
      coverLetterText: "Smoke cover letter",
      coverLetterPdfUrl: "",
      cvUrl: "",
      adminApprovalRequired: false,
      approvalStatus: "NOT_REQUIRED",
      rejectionReason: "",
      status: "READY",
    },
  });

  try {
    await prisma.jobAgentEmailEvent.create({
      data: {
        draftId: draft.id,
        jobPostId: job.id,
        recipientEmail: contact.email,
        eventType: "SENT",
        trackingId: draft.trackingId,
        url: "",
        userAgent: "smoke",
        ipHash: "",
      },
    });

    const limited = await fetch(`${base}/api/admin/job-agent/email/send/${draft.id}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ toEmail: contact.email }),
    });

    if (limited.status !== 429) {
      throw new Error(`Expected daily limit 429, got ${limited.status}.`);
    }

    const pixel = await fetch(`${base}/api/job-agent/track/open/${draft.trackingId}.png`, {
      headers: { "User-Agent": "smoke-open" },
    });
    if (pixel.status !== 200 || !String(pixel.headers.get("content-type")).includes("image/png")) {
      throw new Error("Tracking pixel did not return PNG.");
    }

    const click = await fetch(
      `${base}/api/job-agent/track/click/${draft.trackingId}?url=${encodeURIComponent("https://example.com/path")}`,
      {
        redirect: "manual",
        headers: { "User-Agent": "smoke-click" },
      },
    );
    if (![301, 302, 303, 307, 308].includes(click.status)) {
      throw new Error(`Click endpoint did not redirect: ${click.status}.`);
    }

    const refreshed = await prisma.jobEmailDraft.findUnique({ where: { id: draft.id } });
    if (refreshed.openCount < 1 || refreshed.clickCount < 1) {
      throw new Error("Tracking counters did not increment.");
    }

    const eventWithHash = await prisma.jobAgentEmailEvent.findFirst({
      where: { draftId: draft.id, eventType: "OPENED" },
    });
    if (!eventWithHash?.ipHash) {
      throw new Error("Tracking event missing hashed IP.");
    }
  } finally {
    await prisma.jobPost.deleteMany({ where: { id: job.id } });
    await prisma.jobAgentEmailSetting.update({
      where: { id: 1 },
      data: {
        isEnabled: false,
        smtpPasswordEncrypted: "",
        fromName: "",
        fromEmail: "",
        smtpUsername: "",
        openTrackingEnabled: false,
        clickTrackingEnabled: false,
      },
    });
    if (previousAiSetting) {
      await prisma.jobAgentAiSetting.update({
        where: { id: 1 },
        data: { requireAdminApproval: previousAiSetting.requireAdminApproval },
      });
    }
  }

  console.log("Job Agent email smoke checks passed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
