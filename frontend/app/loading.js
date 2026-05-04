function LoadingCard() {
  return <div className="h-56 rounded-[1.5rem] border border-white/5 bg-white/[0.03]" />;
}

export default function Loading() {
  return (
    <main className="relative mx-auto min-h-screen px-6 py-6 text-white sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem]">
      <section className="overflow-hidden rounded-[1.7rem] border border-[#2b3046] bg-[linear-gradient(180deg,rgba(30,33,49,0.96),rgba(27,30,44,0.96))] p-4 shadow-[0_24px_55px_rgba(0,0,0,0.22)] lg:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="aspect-[9/10] rounded-[1.35rem] bg-white/10" />
          <div className="flex flex-col justify-center">
            <div className="h-6 w-40 rounded-full bg-white/10" />
            <div className="mt-5 h-10 w-full max-w-md rounded-2xl bg-white/10" />
            <div className="mt-5 h-20 w-full rounded-[1.5rem] bg-white/5" />
            <div className="mt-8 flex gap-3">
              <div className="h-12 w-40 rounded-full bg-white/10" />
              <div className="h-12 w-40 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingCard key={index} />
        ))}
      </section>
    </main>
  );
}
