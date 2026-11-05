import { NextResponse } from "next/server";

// Next.js matches this exact route before the catch-all /api/admin rewrite.
// Keep credentials on the request body only and never log them.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data, status, extraHeaders = {}) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}

export async function POST(request) {
  let upstream;
  try {
    const raw = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!raw) {
      return json({ message: "Admin login backend URL is not configured." }, 503);
    }
    const backend = new URL(raw);
    if (!["https:", "http:"].includes(backend.protocol) ||
        (process.env.NODE_ENV === "production" && backend.protocol !== "https:") ||
        backend.username || backend.password) {
      return json({ message: "Admin login backend URL configuration is invalid." }, 503);
    }
    upstream = new URL("/api/admin/login", backend);
  } catch {
    return json({ message: "Admin login backend URL configuration is invalid." }, 503);
  }

  let credentials;
  try {
    // Reject unexpectedly large login bodies before hitting the remote API.
    if (Number(request.headers.get("content-length") || 0) > 16384) {
      return json({ message: "Login request is too large." }, 413);
    }
    credentials = await request.json();
    if (!credentials || typeof credentials !== "object" ||
        typeof credentials.email !== "string" ||
        typeof credentials.password !== "string" ||
        credentials.email.length > 255 || credentials.password.length > 4096) {
      return json({ message: "Valid email and password are required." }, 422);
    }
  } catch {
    return json({ message: "Invalid login JSON payload." }, 400);
  }

  let response;
  try {
    response = await fetch(upstream, {
      method: "POST",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        twoFactorCode: typeof credentials.twoFactorCode === "string"
          ? credentials.twoFactorCode
          : "",
      }),
    });
  } catch {
    return json({ message: "Admin login backend is unreachable or timed out." }, 502);
  }

  if (response.status >= 300 && response.status < 400) {
    return json({ message: "Admin login backend redirected unexpectedly. Check Laravel API routing." }, 502);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!/[/+]json\b/i.test(contentType)) {
    // Never parse or relay HTML error pages (possibly from an upstream CDN).
    return json({
      message: "Admin login backend returned a non-JSON response (HTTP " +
        response.status + "). Check backend routing, logs and proxy status.",
    }, 502);
  }

  try {
    const payload = await response.json();
    const status = response.status >= 200 && response.status <= 599 ? response.status : 502;
    const retryAfter = response.headers.get("retry-after");
    return json(payload, status, retryAfter && response.status === 429
      ? { "Retry-After": retryAfter } : {});
  } catch {
    return json({ message: "Admin login backend returned invalid JSON." }, 502);
  }
}
