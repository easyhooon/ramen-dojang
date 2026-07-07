import type { ReactNode } from "react";

type IconName = "arrowRight" | "home" | "plus" | "search" | "settings" | "star" | "starFilled";

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={["icon-svg", className].filter(Boolean).join(" ")} viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

const icons = {
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  home: <path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <path d="m20 20-4.5-4.5M10.75 18a7.25 7.25 0 1 1 0-14.5 7.25 7.25 0 0 1 0 14.5z" />,
  settings: (
    <>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05-2.1 2.1-.05-.05a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-3v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.05.05-2.1-2.1.05-.05A1.7 1.7 0 0 0 5.06 15a1.7 1.7 0 0 0-1.56-1.03H3.4v-3h.1A1.7 1.7 0 0 0 5.06 9.4a1.7 1.7 0 0 0-.34-1.88l-.05-.05 2.1-2.1.05.05a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 9.73 4.2V4h3v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.05-.05 2.1 2.1-.05.05a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.24v3h-.24A1.7 1.7 0 0 0 19.4 15z" />
    </>
  ),
  star: <path d="m12 3 2.75 5.57 6.15.9-4.45 4.34 1.05 6.13L12 17.05l-5.5 2.89 1.05-6.13L3.1 9.47l6.15-.9z" />,
  starFilled: <path d="m12 3 2.75 5.57 6.15.9-4.45 4.34 1.05 6.13L12 17.05l-5.5 2.89 1.05-6.13L3.1 9.47l6.15-.9z" className="filled" />,
} satisfies Record<IconName, ReactNode>;
