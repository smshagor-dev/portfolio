import { skillsImage } from "@/utils/skill-image";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import SectionHeading from "../section-heading";

function Skills({ skills = [] }) {
  return (
    <section id="skills" className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(124,240,183,0.1),transparent_30%),linear-gradient(180deg,#10192b,#09111d)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-8">
        <SectionHeading
          label="Skills"
          title="Tools and technologies I use to design, build, and ship modern products"
          description="A practical stack shaped by product delivery, frontend systems, backend architecture, and long-term maintainability."
        />

        <div className="w-full mt-10">
          <Marquee
            gradient={false}
            speed={80}
            pauseOnHover={true}
            pauseOnClick={true}
            delay={0}
            play={true}
            direction="left"
          >
            {skills.map((skill, id) => (
              <div
                className="m-3 flex h-fit min-w-fit w-36 cursor-pointer flex-col items-center justify-center rounded-lg transition-all duration-500 group relative hover:scale-[1.12] sm:m-5"
                key={id}
              >
                <div className="h-full w-full overflow-hidden rounded-[1.4rem] border border-[#2b3f58] bg-[linear-gradient(180deg,#10192b,#09111d)] shadow-[0_18px_40px_rgba(0,0,0,0.2)] transition-all duration-500 group-hover:border-[#7cf0b7]">
                  <div className="flex -translate-y-[1px] justify-center">
                    <div className="w-3/4">
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#70d5ff] to-transparent" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-3 p-6">
                    <div className="h-8 sm:h-10">
                      <Image
                        src={skillsImage(skill?.name)?.src}
                        alt={skill?.name}
                        width={40}
                        height={40}
                        className="h-full w-auto rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-white sm:text-lg">
                      {skill?.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default Skills;
