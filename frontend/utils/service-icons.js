import { BsBriefcase, BsCodeSlash, BsPalette, BsRocketTakeoff } from "react-icons/bs";
import { FiLayout, FiMonitor, FiSettings, FiShield } from "react-icons/fi";
import { HiOutlineChartBar, HiOutlineCloud, HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { MdOutlineAutoAwesomeMotion, MdOutlineDesignServices } from "react-icons/md";
import { RiCustomerService2Line, RiDatabase2Line } from "react-icons/ri";

export const serviceIconOptions = [
  { value: "briefcase", label: "Briefcase", icon: BsBriefcase },
  { value: "design", label: "Design", icon: MdOutlineDesignServices },
  { value: "palette", label: "Creative", icon: BsPalette },
  { value: "frontend", label: "Frontend", icon: FiLayout },
  { value: "backend", label: "Backend", icon: RiDatabase2Line },
  { value: "code", label: "Code", icon: BsCodeSlash },
  { value: "mobile", label: "Mobile", icon: HiOutlineDevicePhoneMobile },
  { value: "cloud", label: "Cloud", icon: HiOutlineCloud },
  { value: "support", label: "Support", icon: RiCustomerService2Line },
  { value: "growth", label: "Growth", icon: BsRocketTakeoff },
  { value: "motion", label: "Motion", icon: MdOutlineAutoAwesomeMotion },
  { value: "dashboard", label: "Dashboard", icon: HiOutlineChartBar },
  { value: "product", label: "Product", icon: FiMonitor },
  { value: "systems", label: "Systems", icon: FiSettings },
  { value: "security", label: "Security", icon: FiShield },
];

export function getServiceIconOption(value) {
  return serviceIconOptions.find((item) => item.value === value) || serviceIconOptions[0];
}
