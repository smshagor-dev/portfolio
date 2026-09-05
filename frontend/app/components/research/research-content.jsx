function looksLikeHtml(value) {
  return /<([a-z][\w-]*)(?:\s[^>]*)?>/i.test(String(value || ""));
}

function splitPlainResearchContent(value) {
  const lines = String(value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim());

  const sections = [];
  let current = { title: "Overview", rows: [] };

  const pushCurrent = () => {
    if (current.rows.length > 0) {
      sections.push(current);
    }
  };

  for (const line of lines) {
    if (!line) {
      continue;
    }

    if (["Abstract", "Publication Details", "Authors", "External Identifiers"].includes(line)) {
      pushCurrent();
      current = { title: line, rows: [] };
      continue;
    }

    const separator = line.indexOf(":");
    if (separator > 0 && separator < 36 && current.title !== "Abstract") {
      current.rows.push({
        type: "meta",
        label: line.slice(0, separator).trim(),
        value: line.slice(separator + 1).trim(),
      });
      continue;
    }

    current.rows.push({ type: "text", value: line });
  }

  pushCurrent();
  return sections;
}

export default function ResearchContent({ content, excludeSections = [] }) {
  const normalized = String(content || "").trim();

  if (!normalized) {
    return null;
  }

  if (looksLikeHtml(normalized)) {
    return (
      <div
        className="service-content research-rich-content"
        dangerouslySetInnerHTML={{ __html: normalized }}
      />
    );
  }

  const excluded = new Set(
    (Array.isArray(excludeSections) ? excludeSections : [])
      .map((value) => String(value || "").trim().toLowerCase())
      .filter(Boolean),
  );
  const sections = splitPlainResearchContent(normalized).filter(
    (section) => !excluded.has(String(section.title || "").trim().toLowerCase()),
  );

  if (!sections.length) {
    return null;
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section
          key={`${section.title}-${section.rows[0]?.value || section.rows[0]?.label || "section"}`}
          className="overflow-hidden rounded-[1.6rem] border border-[#22344d] bg-[linear-gradient(180deg,rgba(14,25,42,0.94),rgba(9,17,29,0.96))]"
        >
          <div className="border-b border-[#203049] px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">
              {section.title}
            </p>
          </div>
          <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
            {section.rows.map((row, index) =>
              row.type === "meta" ? (
                <div
                  key={`${row.label}-${index}`}
                  className="grid gap-1 border-b border-[#1d2d42] pb-4 last:border-0 last:pb-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7f98b2]">
                    {row.label}
                  </span>
                  <span className="break-words text-sm leading-7 text-[#d1dbe8]">
                    {row.value}
                  </span>
                </div>
              ) : (
                <p key={`${row.value}-${index}`} className="text-sm leading-8 text-[#c0cede] sm:text-base">
                  {row.value}
                </p>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
