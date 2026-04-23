import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceDetailData } from "@/lib/api";
import ServiceCommentsPanel from "@/app/components/service/service-comments-panel";
import ServiceDetailStats from "@/app/components/service/service-detail-stats";
import { getServiceIconOption } from "@/utils/service-icons";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const data = await getServiceDetailData(resolvedParams.slug).catch(() => null);

  return buildPageMetadata(data?.siteSettings, {
    title: data?.service?.name || "Service",
    description: data?.service?.description || "Service details page.",
    path: `/service/${resolvedParams.slug}`,
  });
}

export default async function ServiceDetailPage({ params }) {
  const resolvedParams = await params;
  const data = await getServiceDetailData(resolvedParams.slug).catch(() => null);

  if (!data?.service) {
    notFound();
  }

  const { service, siteSettings, relatedServices = [] } = data;

  return (
    <div className="py-8 text-white">
      <section className="overflow-hidden rounded-[2rem] border border-[#22324a] bg-[radial-gradient(circle_at_top,rgba(112,213,255,0.16),transparent_28%),linear-gradient(180deg,#10192c,#09111d)] shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="p-6 md:p-8 xl:p-10">
            <Link
              href="/service"
              className="inline-flex items-center gap-2 text-sm text-[#79d4ff] transition hover:text-white"
            >
              <span>{"<"}</span>
              Back to services
            </Link>

            <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              {service.name}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-[#bcc8d8] md:text-base">
              {service.description}
            </p>

            <ServiceDetailStats
              serviceSlug={service.slug}
              views={service.views || 0}
              impressions={service.impressionCount || 0}
              comments={service.comments?.length || 0}
            />

            <div className="service-content mt-8 border-t border-[#203049] pt-8" dangerouslySetInnerHTML={{ __html: service.content }} />

            <div className="mt-8 rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Need this service?</p>
              <p className="mt-3 text-sm leading-7 text-[#bfd0e2]">
                Reach out at {siteSettings?.contactEmail || "the contact page"} and include your scope, timeline, and required features.
              </p>
            </div>
          </div>

          <aside className="border-t border-[#1d2d42] bg-[linear-gradient(180deg,rgba(10,18,31,0.82),rgba(8,13,23,0.96))] p-6 xl:border-l xl:border-t-0 xl:p-8">
            <div className="rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">More Services</p>
              <div className="mt-4 space-y-3">
                {relatedServices.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2a3b55] bg-[#0e1829] p-4 text-sm text-[#9fb1c7]">
                    No related services available.
                  </div>
                ) : (
                  relatedServices.map((item) => {
                    const RelatedServiceIcon = getServiceIconOption(item.icon).icon;

                    return (
                      <Link
                        key={item.id}
                        href={`/service/${item.slug}`}
                        className="block rounded-[1.25rem] border border-[#24344d] bg-[#0d1728] p-4 transition hover:border-[#3a5678]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#29405d] bg-[#11253a] text-[#8fdcff]">
                            <RelatedServiceIcon size={17} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white">{item.name}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#8fa4bb]">
                          <span className="inline-flex items-center gap-2">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
                              <path
                                d="M4 6.5h16M6.5 3v7M17.5 3v7M5 10h14a2 2 0 0 1 2 2v5a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-5a2 2 0 0 1 2-2Z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path d="M8.5 14.5h7M8.5 17.5h4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>{item.impressionCount || 0}</span>
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
                              <path
                                d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <circle cx="12" cy="12" r="2.5" />
                            </svg>
                            <span>{item.views || 0}</span>
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8">
                              <path d="M7 10h10M7 14h6" strokeLinecap="round" strokeLinejoin="round" />
                              <path
                                d="M6 19.5V18a3 3 0 0 0-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-3 1.5Z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>{item._count?.comments || 0}</span>
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <ServiceCommentsPanel serviceSlug={service.slug} comments={service.comments || []} />
    </div>
  );
}
