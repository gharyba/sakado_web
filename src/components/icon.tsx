import type { CSSProperties } from "react";
export function Icon({
  name = "arrow",
  size = 20,
  style,
}: {
  name?:
    | "arrow"
    | "compass"
    | "tent"
    | "trail"
    | "sun"
    | "pin"
    | "calendar"
    | "instagram"
    | "close";
  size?: number;
  style?: CSSProperties;
}) {
  const paths = {
    arrow: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m16 8-3 5-5 3 3-5z" />
      </>
    ),
    tent: (
      <>
        <path d="m2 20 10-16 10 16H2zm6 0 4-7 4 7M10 2l4 4M14 2l-4 4" />
      </>
    ),
    trail: (
      <>
        <path d="m3 20 7-13 4 7 3-5 5 11H3" />
        <circle cx="17" cy="4" r="2" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
      </>
    ),
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17 7h.01" />
      </>
    ),
    close: <path d="m5 5 14 14M19 5 5 19" />,
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
