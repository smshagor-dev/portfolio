import Image from "next/image";
import experienceAnimation from "../../../assets/lottie/code.json";
import AnimationLottie from "../../helper/animation-lottie";
import SectionHeading from "../section-heading";

function Experience({ experiences = [] }) {
  if (!experiences.length) {
    return null;
  }

  return (
    <div id="experience" className="relative z-50 my-12 lg:my-24">
      <Image
        src="/section.svg"
        alt="Hero"
        width={1572}
        height={795}
        className="absolute top-0 -z-10 opacity-70"
      />

      <div className="overflow-hidden rounded-[2rem] border border-[#25213b] bg-[radial-gradient(circle_at_top,rgba(43,132,255,0.12),transparent_30%),linear-gradient(180deg,rgba(16,23,45,0.96),rgba(9,14,28,0.98))] px-5 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.25)] md:px-8">
        <div className="py-8">
          <SectionHeading
            label="Experience"
            title="Hands-on experience across real products, teams, and delivery cycles"
            description="A mix of backend ownership, product collaboration, and day-to-day execution across client and internal work."
            className="mb-8"
          />

          <div className="flex flex-col gap-8 lg:gap-10">
            {experiences.map((item, index) => {
              const isReversed = index % 2 === 1;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[1.9rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] shadow-[0_20px_55px_rgba(0,0,0,0.2)]"
                >
                  <div className="grid items-stretch gap-0 lg:grid-cols-2">
                    <div
                      className={`relative flex border-b border-[#24344d] p-5 lg:border-b-0 ${
                        isReversed ? "lg:order-2 lg:border-l" : "lg:order-1 lg:border-r"
                      }`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(122,97,255,0.16),transparent_40%),radial-gradient(circle_at_bottom,rgba(34,211,238,0.14),transparent_42%)]" />
                      <div className="relative flex w-full">
                        <div className="flex h-full min-h-[320px] w-full flex-col rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(14,24,48,0.92),rgba(11,19,37,0.98))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:p-5 lg:min-h-0">
                          <div className="flex flex-1 items-center justify-center">
                            <div className="w-full max-w-[520px]">
                              <AnimationLottie animationPath={experienceAnimation} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`relative p-5 lg:p-7 ${isReversed ? "lg:order-1" : "lg:order-2"}`}>
                      <Image
                        src="/blur-23.svg"
                        alt="Experience"
                        width={1080}
                        height={200}
                        className="absolute bottom-0 right-0 opacity-70"
                      />

                      <div className="relative h-full rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(14,24,48,0.88),rgba(11,19,37,0.96))] p-5">
                        <div className="flex flex-col gap-5 border-b border-[#263953] pb-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <h3 className="mt-2 text-2xl font-semibold text-white">
                              {item.title}
                            </h3>

                            <p className="mt-4 text-base text-[#d2dceb]">{item.company}</p>
                          </div>

                          <div className="grid gap-4 text-left lg:min-w-[220px] lg:text-right">
                            <div>
                              <p className="text-sm text-[#d2dceb]">
                                {item.location || "Not specified"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-[#16f2b3]">{item.duration}</p>
                            </div>
                          </div>
                        </div>

                        {item.description ? (
                          <div className="mt-5">
                            <div
                              className="experience-content text-sm leading-7 text-[#d6dfec] [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:text-white [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2"
                              dangerouslySetInnerHTML={{ __html: item.description }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Experience;
