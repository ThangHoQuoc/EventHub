export type LineIconName =
  | "alert" | "arrow-right" | "bank" | "bookmark" | "building" | "calendar"
  | "card" | "check" | "chevron-down" | "clock" | "copy" | "download"
  | "eye" | "eye-off" | "home" | "info" | "lock" | "mail" | "map-pin"
  | "minus" | "phone" | "plus" | "refresh" | "search" | "share" | "shield"
  | "sparkles" | "ticket" | "trash" | "trending" | "user" | "x";

type LineIconProps = {
  name: LineIconName;
  className?: string;
};

export function LineIcon({ className = "", name }: LineIconProps) {
  const paths: Record<LineIconName, React.ReactNode> = {
    alert: <><path d="M10 2.5 18 17H2L10 2.5Z" /><path d="M10 7v4.5M10 14.3v.2" /></>,
    "arrow-right": <><path d="M4 10h12M12 6l4 4-4 4" /></>,
    bank: <><path d="m2.5 7.5 7.5-4 7.5 4M4 8.5v6M8 8.5v6M12 8.5v6M16 8.5v6M2.5 16.5h15" /></>,
    bookmark: <path d="M5.5 3.2h9v14L10 14.3l-4.5 2.9v-14Z" />,
    building: <><rect x="3" y="2.5" width="14" height="15" rx="1.5" /><path d="M7 6h2M11 6h2M7 10h2M11 10h2M8 17.5v-4h4v4" /></>,
    calendar: <><rect height="15" rx="2" width="16" x="2" y="3.5" /><path d="M6 1.8v3.5M14 1.8v3.5M2 8h16" /></>,
    card: <><rect x="2" y="4" width="16" height="12" rx="2" /><path d="M2 8h16M5 12h4" /></>,
    check: <path d="m4 10 4 4 8-9" />,
    "chevron-down": <path d="m5 8 5 5 5-5" />,
    clock: <><circle cx="10" cy="10" r="7.5" /><path d="M10 6v4.5l3 1.8" /></>,
    copy: <><rect x="6" y="6" width="11" height="11" rx="2" /><path d="M4 14H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    download: <><path d="M10 2v10M6 9l4 4 4-4" /><path d="M3 16v2h14v-2" /></>,
    eye: <><path d="M2 10s2.8-4.5 8-4.5S18 10 18 10s-2.8 4.5-8 4.5S2 10 2 10Z" /><circle cx="10" cy="10" r="2" /></>,
    "eye-off": <><path d="m3 3 14 14M8.5 5.7A8.6 8.6 0 0 1 10 5.5c5.2 0 8 4.5 8 4.5a12 12 0 0 1-2.1 2.7M12.2 14.2a7.8 7.8 0 0 1-2.2.3C4.8 14.5 2 10 2 10a12.2 12.2 0 0 1 2.2-2.8" /></>,
    home: <><path d="m2.5 9 7.5-6 7.5 6v8H12v-5H8v5H2.5V9Z" /></>,
    info: <><circle cx="10" cy="10" r="8" /><path d="M10 9v5M10 6v.2" /></>,
    lock: <><rect height="10" rx="2" width="14" x="3" y="8.5" /><path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5M10 12.3v2.5" /></>,
    mail: <><rect height="13" rx="2" width="17" x="1.5" y="3.5" /><path d="m3 5 7 5 7-5" /></>,
    "map-pin": <><path d="M10 18s5-4.5 5-10a5 5 0 0 0-10 0c0 5.5 5 10 5 10Z" /><circle cx="10" cy="8" r="1.7" /></>,
    minus: <path d="M4 10h12" />,
    phone: <><path d="M6 2.5 8.5 6 7 8c1 2.5 2.5 4 5 5l2-1.5 3.5 2.5-1 3c-.3.9-1.2 1.5-2.2 1.3C7.5 17.2 2.8 12.5 1.7 5.7 1.5 4.7 2.1 3.8 3 3.5l3-1Z" /></>,
    plus: <path d="M10 4v12M4 10h12" />,
    refresh: <><path d="M16 6V2l-2 2a7 7 0 1 0 2 8" /></>,
    search: <><circle cx="9" cy="9" r="5.5" /><path d="m13 13 4 4" /></>,
    share: <><circle cx="15.5" cy="4.5" r="2.5" /><circle cx="4.5" cy="10" r="2.5" /><circle cx="15.5" cy="15.5" r="2.5" /><path d="m6.8 8.9 6.4-3.2M6.8 11.1l6.4 3.2" /></>,
    shield: <><path d="M10 2 17 5v5c0 4.2-2.8 6.8-7 8-4.2-1.2-7-3.8-7-8V5l7-3Z" /><path d="m6.8 10 2 2 4.2-4.5" /></>,
    sparkles: <><path d="M10 2.5c.5 4 3 6.5 7 7-4 .5-6.5 3-7 7-.5-4-3-6.5-7-7 4-.5 6.5-3 7-7Z" /><path d="M16 2v3M14.5 3.5h3" /></>,
    ticket: <><path d="M2 5h16v3a2 2 0 0 0 0 4v3H2v-3a2 2 0 0 0 0-4V5Z" /><path d="M7 5v10" /></>,
    trash: <><path d="M4 6h12M8 3h4l1 3H7l1-3ZM6 6l1 11h6l1-11M9 9v5M11 9v5" /></>,
    trending: <><path d="m3 14 5-5 3 3 6-7" /><path d="M13 5h4v4" /></>,
    user: <><circle cx="10" cy="6" r="3" /><path d="M3.5 17a6.5 6.5 0 0 1 13 0" /></>,
    x: <path d="m5 5 10 10M15 5 5 15" />,
  };

  return (
    <svg aria-hidden="true" className={`line-icon ${className}`.trim()} fill="none" viewBox="0 0 20 20">
      {paths[name]}
    </svg>
  );
}
