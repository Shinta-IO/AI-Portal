"use client";

import { ComponentType } from "react";
import clsx from "clsx";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badgeCount?: number;
  active?: boolean;
  hovered: string | null;
  setHovered: (href: string | null) => void;
  onClick: () => void;
}

export default function SidebarItem({
  href,
  label,
  icon: Icon,
  badgeCount = 0,
  active = false,
  hovered,
  setHovered,
  onClick,
}: SidebarItemProps) {
  const isHovered = hovered === href;
  const showBadge = badgeCount > 0;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(href)}
      onMouseLeave={() => setHovered(null)}
      className={clsx(
        "group flex items-center gap-3 px-4 py-2 rounded-lg mx-2 transition-all relative w-full text-left",
        active
          ? "bg-brand-primary text-white"
          : isHovered
          ? "bg-brand-light dark:bg-brand-dark text-brand-yellow"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-brand-light hover:dark:bg-brand-dark hover:text-brand-yellow"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden lg:inline-block text-sm font-medium">{label}</span>

      {showBadge && (
        <span className="absolute right-3 top-2 lg:right-4 inline-block px-2 py-0.5 text-xs font-bold rounded-full text-white bg-red-500">
          {badgeCount}
        </span>
      )}

      {!active && isHovered && (
        <span className="absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black text-white px-2 py-1 text-xs rounded shadow-md lg:hidden">
          {label}
        </span>
      )}
    </button>
  );
}
