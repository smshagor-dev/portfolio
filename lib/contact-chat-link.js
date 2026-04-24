export function buildContactChatHash(ticketId, token) {
  const normalizedId = String(ticketId || "").trim();
  const normalizedToken = String(token || "").trim();

  if (!normalizedId || !normalizedToken) {
    return "";
  }

  return `${normalizedId}.${normalizedToken}`;
}

export function parseContactChatHash(hashValue) {
  const normalizedHash = String(hashValue || "").trim();
  const separatorIndex = normalizedHash.indexOf(".");

  if (!normalizedHash || separatorIndex <= 0 || separatorIndex === normalizedHash.length - 1) {
    return null;
  }

  const id = Number.parseInt(normalizedHash.slice(0, separatorIndex), 10);
  const token = normalizedHash.slice(separatorIndex + 1).trim();

  if (!Number.isFinite(id) || id <= 0 || !token) {
    return null;
  }

  return { id, token };
}
