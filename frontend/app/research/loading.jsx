export default function ResearchLoading() {
  return (
    <div className="py-8 text-white">
      <section className="h-56 animate-pulse rounded-[2rem] border border-[#22324a] bg-[#0d1728]" />
      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-[420px] animate-pulse rounded-[1.75rem] border border-[#24344d] bg-[#0d1728]"
          />
        ))}
      </section>
    </div>
  );
}
