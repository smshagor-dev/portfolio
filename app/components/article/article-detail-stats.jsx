"use client";

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[1rem] border border-[#24344d] bg-[#0d1728] px-4 py-3">
      <span className="text-sm text-[#9fb1c7]">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

export default function ArticleDetailStats({
  author = "Editorial Desk",
  publishDate = "Draft",
}) {
  return (
    <div className="mt-4 space-y-3">
      <StatRow label="Author" value={author || "Editorial Desk"} />
      <StatRow label="Published" value={publishDate} />
    </div>
  );
}
