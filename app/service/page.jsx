import { getServicesPageData } from "@/lib/api";
import ServiceCard from "@/app/components/homepage/services/service-card";

export const dynamic = "force-dynamic";

export default async function ServicePage() {
  const { serviceSection, services = [] } = await getServicesPageData();

  return (
    <div className="py-8 text-white">
      <section className="rounded-[1.75rem] border border-[#22324a] bg-[linear-gradient(180deg,#0f192b,#0a1321)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] md:p-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#70d5ff]">Services</p>
          <div className="mt-4">
            <h1 className="text-3xl font-semibold leading-tight text-[#f5f8fd] md:text-4xl">
              {serviceSection?.title || "Services"}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#b8c7d8] md:text-base">
              {serviceSection?.subtitle || ""}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#263753] bg-[#0e1829] p-6 text-sm text-[#9fb1c7]">
            No services published yet.
          </div>
        ) : (
          services.map((service) => <ServiceCard key={service.id} service={service} />)
        )}
      </section>
    </div>
  );
}
