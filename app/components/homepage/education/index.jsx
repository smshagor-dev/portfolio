import Image from "next/image";
import { BsPersonWorkspace } from "react-icons/bs";
import lottieFile from '../../../assets/lottie/study.json';
import AnimationLottie from "../../helper/animation-lottie";
import GlowCard from "../../helper/glow-card";
import SectionHeading from "../section-heading";

function Education({ educations = [] }) {
  return (
    <div id="education" className="relative z-50 my-12 lg:my-24">
      <Image
        src="/section.svg"
        alt="Hero"
        width={1572}
        height={795}
        className="absolute top-0 -z-10 opacity-70"
      />

      <div className="overflow-hidden rounded-[2rem] border border-[#25213b] bg-[radial-gradient(circle_at_top,rgba(22,242,179,0.1),transparent_28%),linear-gradient(180deg,rgba(16,23,45,0.96),rgba(9,14,28,0.98))] px-5 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.25)] md:px-8">
        <div className="py-8">
          <SectionHeading
            label="Education"
            title="Learning foundations that shaped the way I think, build, and solve"
            description="Academic milestones that supported my technical growth and helped form a stronger product mindset."
            className="mb-8"
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex flex-col gap-6">
                {
                  educations.map(education => (
                    <GlowCard key={education.id} identifier={`education-${education.id}`}>
                      <div className="relative p-4 text-white">
                        <Image
                          src="/blur-23.svg"
                          alt="Hero"
                          width={1080}
                          height={200}
                          className="absolute bottom-0 opacity-80"
                        />
                        <div className="flex justify-center">
                          <p className="text-xs sm:text-sm text-[#16f2b3]">
                            {education.duration}
                          </p>
                        </div>
                        <div className="flex items-center gap-x-8 px-3 py-5">
                          <div className="rounded-2xl border border-[#244f46] bg-[#0f241f] text-[#16f2b3] transition-all duration-300 hover:scale-110 p-3">
                            <BsPersonWorkspace size={30} />
                          </div>
                          <div>
                            <p className="mb-2 text-base font-medium uppercase sm:text-xl">
                              {education.title}
                            </p>
                            <p className="text-sm sm:text-base text-[#c9d3e3]">{education.institution}</p>
                          </div>
                        </div>
                      </div>
                    </GlowCard>
                  ))
                }
              </div>
            </div>

            <div className="flex items-start justify-center">
              <div className="w-full rounded-[1.75rem] border border-[#24344d] bg-[linear-gradient(180deg,#0e1830,#0b1325)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                <div className="mx-auto w-3/4">
                  <AnimationLottie animationPath={lottieFile} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
