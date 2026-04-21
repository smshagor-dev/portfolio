import Image from "next/image";
import SectionHeading from "../section-heading";

function buildTestimonials(services = []) {
  return services
    .flatMap((service) =>
      (service?.comments || []).map((comment) => ({
        id: comment.id || `${service?.slug || "service"}-${comment?.createdAt || comment?.impression || "comment"}`,
        serviceName: service?.name || "Service",
        name: comment?.impression || "Anonymous",
        photo: comment?.photo || "/profile.png",
        comment: comment?.comment || "",
        createdAt: comment?.createdAt || null,
      })),
    )
    .filter((item) => item.comment)
    .slice(0, 6);
}

function formatDate(value) {
  if (!value) {
    return "Recent feedback";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function TestimonialsSection({ services = [] }) {
  const items = buildTestimonials(services);

  if (!items.length) {
    return null;
  }

  return (
    <section id="testimonials" className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(124,240,183,0.12),transparent_30%),linear-gradient(180deg,#10192b,#09111d)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-8">
        <SectionHeading
          label="Testimonials"
          title="Client reactions, team feedback, and practical trust earned through delivery"
          description="Short notes from collaborators and clients that reflect communication, execution quality, and the overall working experience."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative overflow-hidden rounded-[1.75rem] border border-[#2b3f58] bg-[linear-gradient(180deg,rgba(17,27,44,0.98),rgba(9,15,26,0.98))] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#7cf0b7]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(124,240,183,0.85),rgba(112,213,255,0.75),transparent)]" />
              <div className="absolute -left-8 top-4 h-20 w-20 rounded-full bg-[#7cf0b7]/10 blur-3xl transition duration-300 group-hover:bg-[#7cf0b7]/20" />
              <div className="flex items-center gap-4">
                <div className="overflow-hidden rounded-[1.2rem] border border-[#36506b] bg-[#102038]">
                  <Image
                    src={item.photo}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="h-[60px] w-[60px] object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[#7cf0b7]">
                    {item.serviceName}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-[#c5d3e2]">{item.comment}</p>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#22334a] pt-4">
                <span className="text-[11px] uppercase tracking-[0.24em] text-[#88a0ba]">
                  {formatDate(item.createdAt)}
                </span>
                <span className="rounded-full border border-[#305246] bg-[#0f211b] px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#a9edd0]">
                  Verified feedback
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
