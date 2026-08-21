import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { SocialPlatform } from "@/lib/constants";

export interface PlatformConfig {
  label: string;
  Icon: IconType;
  color: string;
  /**
   * "enabled": active for OAuth connection
   * "disabled": present in UI but connection is disabled/unavailable (e.g. Facebook while integration is in progress)
   * "hidden": omitted from the connect grid (e.g. Pinterest not implemented)
   */
  availability: "enabled" | "disabled" | "hidden";
  disabledReason?: string;
}

export const PLATFORM_META: Record<SocialPlatform, PlatformConfig> = {
  facebook: {
    label: "Facebook",
    Icon: FaFacebook,
    color: "#1877F2",
    availability: "disabled",
    disabledReason: "Integration in progress",
  },
  instagram: {
    label: "Instagram",
    Icon: FaInstagram,
    color: "#E1306C",
    availability: "enabled",
  },
  linkedin: {
    label: "LinkedIn",
    Icon: FaLinkedin,
    color: "#0A66C2",
    availability: "enabled",
  },
  twitter: {
    label: "X",
    Icon: FaXTwitter,
    color: "#000000",
    availability: "enabled",
  },
  youtube: {
    label: "YouTube",
    Icon: FaYoutube,
    color: "#FF0000",
    availability: "enabled",
  },
  pinterest: {
    label: "Pinterest",
    Icon: FaPinterest,
    color: "#E60023",
    availability: "hidden",
    disabledReason: "Not available",
  },
};

