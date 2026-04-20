import { BsAward, BsBriefcase, BsCodeSlash, BsPeople, BsRocketTakeoff } from "react-icons/bs";
import { FaCode, FaFolderOpen, FaGlobe, FaHeart, FaStar } from "react-icons/fa";
import { HiOutlineAcademicCap, HiOutlineLightBulb } from "react-icons/hi2";
import { MdOutlineEmojiEvents, MdOutlineWorkspacePremium } from "react-icons/md";
import { RiCustomerService2Line, RiProjectorLine } from "react-icons/ri";

export const statsIconOptions = [
  { value: "projects", label: "Projects", icon: RiProjectorLine },
  { value: "clients", label: "Clients", icon: BsPeople },
  { value: "experience", label: "Experience", icon: BsBriefcase },
  { value: "awards", label: "Awards", icon: BsAward },
  { value: "code", label: "Code", icon: BsCodeSlash },
  { value: "support", label: "Support", icon: RiCustomerService2Line },
  { value: "rocket", label: "Growth", icon: BsRocketTakeoff },
  { value: "global", label: "Global", icon: FaGlobe },
  { value: "achievement", label: "Achievement", icon: MdOutlineEmojiEvents },
  { value: "premium", label: "Premium", icon: MdOutlineWorkspacePremium },
  { value: "education", label: "Education", icon: HiOutlineAcademicCap },
  { value: "ideas", label: "Ideas", icon: HiOutlineLightBulb },
  { value: "folder", label: "Portfolio", icon: FaFolderOpen },
  { value: "heart", label: "Happy Clients", icon: FaHeart },
  { value: "star", label: "Featured", icon: FaStar },
  { value: "developer", label: "Developer", icon: FaCode },
];

export function getStatsIconOption(value) {
  return statsIconOptions.find((item) => item.value === value) || statsIconOptions[0];
}
