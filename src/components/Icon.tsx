type IconName = "alert" | "arrow" | "calendar" | "check" | "chevron" | "clock" | "copy" | "edit" | "facebook" | "home" | "image" | "logout" | "mail" | "menu" | "moon" | "phone" | "plus" | "search" | "sparkle" | "telegram" | "trash" | "user" | "x";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, React.ReactNode> = {
    alert: <><path d="m12 3 9 17H3L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M16 2v4M8 2v4M3 9h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" /></>,
    edit: <><path d="m4 16-.7 4.7L8 20l10.8-10.8a2.5 2.5 0 0 0-3.5-3.5Z" /><path d="m14 7 3 3" /></>,
    facebook: <path d="M14 8h2V4h-2.2C10.9 4 9 5.8 9 9v2H6v4h3v5h4v-5h3l.7-4H13V9c0-.7.3-1 1-1Z" />,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 17 5-5 3 3 2-2 6 6" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
    plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    phone: <path d="M6.6 3.5 9 3l1.5 4-1.8 1.7a15 15 0 0 0 6.1 6.1l1.7-1.8 4 1.5-.5 2.4a2 2 0 0 1-2.2 1.6C10.6 17.7 6.3 13.4 5 6.2a2 2 0 0 1 1.6-2.7Z" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    sparkle: <><path d="m12 3-1.2 5.8L5 10l5.8 1.2L12 17l1.2-5.8L19 10l-5.8-1.2Z" /><path d="m19 16-.5 2.5L16 19l2.5.5L19 22l.5-2.5L22 19l-2.5-.5Z" /></>,
    telegram: <path d="m21.5 4.8-3.1 14.5c-.2 1- .8 1.2-1.6.7l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.8.4l.3-4.6 8.3-7.5c.4-.3-.1-.5-.6-.2L7 13.4 2.6 12c-1-.3-1-1 .2-1.5L20 3.9c.9-.3 1.7.2 1.5.9Z" />,
    trash: <><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}
