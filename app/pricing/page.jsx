import Link from "next/link";

const pricingPlans = [
  {
    name: "Starter",
    price: "$149",
    description: "Best for a simple landing page or quick portfolio refresh.",
    features: [
      "Single-page website",
      "Responsive layout",
      "Basic contact integration",
      "Delivery support",
    ],
  },
  {
    name: "Business",
    price: "$499",
    description: "A stronger setup for businesses that need multiple sections and backend thinking.",
    features: [
      "Multi-page website",
      "Node.js backend setup",
      "Database integration",
      "Admin-friendly structure",
    ],
  },
  {
    name: "Custom",
    price: "Let’s Talk",
    description: "For advanced systems, dashboards, AI features, or full product builds.",
    features: [
      "Custom scope planning",
      "Full-stack architecture",
      "Third-party integrations",
      "Deployment and support",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="py-8 text-white">
      <section className="rounded-3xl border border-[#25213b] bg-[radial-gradient(circle_at_top_left,#1e293b,rgba(16,23,45,1)_58%)] p-8 lg:p-12">
        <p className="text-sm uppercase tracking-[0.35em] text-[#16f2b3]">Pricing</p>
        <h1 className="mt-4 text-4xl font-bold lg:text-5xl">
          Flexible plans for personal brands and growing businesses.
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[#d3d8e8] lg:text-lg">
          Choose a clean starting point, then scale the scope based on features,
          pages, and backend requirements.
        </p>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-3xl border border-[#25213b] bg-[#10172d] p-8 shadow-[0_0_30px_rgba(0,0,0,0.18)]"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-[#16f2b3]">{plan.name}</p>
            <h2 className="mt-4 text-4xl font-bold">{plan.price}</h2>
            <p className="mt-4 text-sm text-[#d3d8e8]">{plan.description}</p>
            <div className="my-6 h-px w-full bg-[#2d3555]" />
            <div className="space-y-3">
              {plan.features.map((feature) => (
                <p key={feature} className="text-sm text-white">
                  {feature}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/contact"
          className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:opacity-90"
        >
          Start A Project
        </Link>
      </div>
    </div>
  );
}
