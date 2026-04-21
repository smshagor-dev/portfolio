import Image from "next/image";
import { BsPersonWorkspace } from "react-icons/bs";
import experience from '../../../assets/lottie/code.json';
import AnimationLottie from "../../helper/animation-lottie";
import GlowCard from "../../helper/glow-card";
import SectionHeading from "../section-heading";

function Experience({ experiences = [] }) {
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="flex items-start justify-center">
              <div className="w-full rounded-[1.75rem] border border-[#24344d] bg-[linear-gradient(180deg,#0e1830,#0b1325)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                <AnimationLottie animationPath={experience} />
              </div>
            </div>

            <div>
              <div className="flex flex-col gap-6">
                {
                  experiences.map(experience => (
                    <GlowCard key={experience.id} identifier={`experience-${experience.id}`}>
                      <div className="relative p-4">
                        <Image
                          src="/blur-23.svg"
                          alt="Hero"
                          width={1080}
                          height={200}
                          className="absolute bottom-0 opacity-80"
                        />
                        <div className="flex justify-center">
                          <p className="text-xs sm:text-sm text-[#16f2b3]">
                            {experience.duration}
                          </p>
                        </div>
                        <div className="flex items-center gap-x-8 px-3 py-5">
                          <div className="rounded-2xl border border-[#3a3560] bg-[#17112f] p-3 text-violet-400 transition-all duration-300 hover:scale-110">
                            <BsPersonWorkspace size={30} />
                          </div>
                          <div>
                            <p className="mb-2 text-base font-medium uppercase sm:text-xl">
                              {experience.title}
                            </p>
                            <p className="text-sm sm:text-base text-[#c9d3e3]">
                              {experience.company}
                            </p>
                          </div>
                        </div>
                      </div>
                    </GlowCard>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
