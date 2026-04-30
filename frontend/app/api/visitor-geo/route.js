import { NextResponse } from "next/server";

function normalizeString(value) {
  return String(value || "").trim();
}

function getRequestIp(request) {
  const forwarded = normalizeString(request.headers.get("x-forwarded-for"));
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "";
  }

  const realIp = normalizeString(request.headers.get("x-real-ip"));
  if (realIp) {
    return realIp;
  }

  return normalizeString(request.headers.get("cf-connecting-ip"));
}

function isPublicIp(ip) {
  if (!ip) {
    return false;
  }

  const value = ip.replace(/^::ffff:/, "");
  return !(
    value === "127.0.0.1" ||
    value === "::1" ||
    value.startsWith("10.") ||
    value.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(value)
  );
}

async function fetchGeoFromIp(ipAddress) {
  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ipAddress)}?fields=status,country,regionName,city`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data?.status !== "success") {
      return null;
    }

    return {
      country: normalizeString(data.country),
      region: normalizeString(data.regionName),
      city: normalizeString(data.city),
    };
  } catch (_error) {
    return null;
  }
}

export async function GET(request) {
  const ipAddress = getRequestIp(request);

  if (!isPublicIp(ipAddress)) {
    return NextResponse.json({
      success: true,
      ipAddress,
      country: "",
      region: "",
      city: "",
    });
  }

  try {
    const geoData = await fetchGeoFromIp(ipAddress);

    return NextResponse.json({
      success: Boolean(geoData),
      ipAddress,
      country: normalizeString(geoData?.country),
      region: normalizeString(geoData?.region),
      city: normalizeString(geoData?.city),
    });
  } catch (_error) {
    return NextResponse.json({
      success: false,
      ipAddress,
      country: "",
      region: "",
      city: "",
    });
  }
}
