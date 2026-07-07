import { ArrowRight, Home, Plus, Search, Settings, Star, type LucideIcon } from "lucide-react";

type IconName = "arrowRight" | "home" | "plus" | "search" | "settings" | "star" | "starFilled";

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const LucideIcon = icons[name];

  return <LucideIcon className={["icon-svg", className].filter(Boolean).join(" ")} fill={name === "starFilled" ? "currentColor" : "none"} aria-hidden="true" />;
}

const icons = {
  arrowRight: ArrowRight,
  home: Home,
  plus: Plus,
  search: Search,
  settings: Settings,
  star: Star,
  starFilled: Star,
} satisfies Record<IconName, LucideIcon>;
