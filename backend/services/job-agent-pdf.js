const fs = require("fs/promises");
const path = require("path");

function normalizeString(value) {
  return String(value || "").trim();
}

function escapePdfText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapLine(line, maxChars = 88) {
  const words = String(line || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    if (`${current} ${word}`.trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function buildPdfLines({ applicantName, applicantEmail, portfolioUrl, jobTitle, company, coverLetterText }) {
  const header = [
    applicantName || "Md Shahanur Islam Shagor",
    applicantEmail,
    portfolioUrl,
    "",
    `${jobTitle || "Cover Letter"}${company ? ` - ${company}` : ""}`,
    "",
  ].filter((line, index) => index < 3 ? Boolean(line) : true);

  const body = normalizeString(coverLetterText)
    .split(/\r?\n/)
    .flatMap((line) => wrapLine(line, 88));

  return [...header, ...body].slice(0, 70);
}

function buildSimplePdf(lines) {
  const pageHeight = 792;
  const lineHeight = 15;
  const startY = 744;
  const content = [
    "BT",
    "/F1 11 Tf",
    "50 744 Td",
    "14 TL",
    ...lines.flatMap((line, index) => {
      const escaped = escapePdfText(line);
      return index === 0 ? [`(${escaped}) Tj`] : ["T*", `(${escaped}) Tj`];
    }),
    "ET",
  ].join("\n");
  const stream = Buffer.from(content, "utf8");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

async function generateCoverLetterPdf({ draftId, job, profileContext, coverLetterText }) {
  const uploadRoot = path.resolve(process.cwd(), "public", "uploads", "job-agent");
  await fs.mkdir(uploadRoot, { recursive: true });

  const profile = profileContext?.profile || {};
  const lines = buildPdfLines({
    applicantName: profile.name || "Md Shahanur Islam Shagor",
    applicantEmail: profile.email,
    portfolioUrl: profile.github || profile.linkedIn || profile.devUsername,
    jobTitle: job?.title,
    company: job?.company,
    coverLetterText,
  });
  const filename = `cover-letter-${draftId}-${Date.now()}.pdf`;
  const filePath = path.join(uploadRoot, filename);
  await fs.writeFile(filePath, buildSimplePdf(lines));

  return {
    publicUrl: `/uploads/job-agent/${filename}`,
    filePath,
  };
}

module.exports = {
  generateCoverLetterPdf,
};
