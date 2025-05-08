"use client";

import { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import clsx from "clsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badgeCount?: number;
  active?: boolean;
  hovered: string | null;
  setHovered: (href: string | null) => void;
  onClick: () => void;
  colorClass?: string;
  isDark?: boolean;
  activeClass?: string;
  hoverClass?: string;
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
  colorClass,
  isDark = true,
  activeClass,
  hoverClass,
}: SidebarItemProps) {
  const isHovered = hovered === href;
  const showBadge = badgeCount > 0;

  // Use provided activeClass and hoverClass if available, otherwise fall back to colorClass
  const activeStyle = active && (activeClass || colorClass);
  const hoverStyle = !active && isHovered && (hoverClass || "bg-white/10 text-white shadow-sm border border-white/5");
  const normalStyle = !active && !isHovered && (isDark 
    ? "text-white/70 hover:text-brand-accent border border-transparent" 
    : "text-brand-dark/70 hover:text-brand-primary border border-transparent");

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          variant={active ? "default" : "ghost"}
          onMouseEnter={() => setHovered(href)}
          onMouseLeave={() => setHovered(null)}
          className={clsx(
            "w-full justify-start gap-3 px-3.5 py-2.5 rounded-lg transition-all text-sm font-medium",
            activeStyle,
            hoverStyle,
            normalStyle
          )}
        >
          <Icon className={clsx(
            "w-5 h-5 transition-transform duration-200", 
            active && "scale-110",
            active && isDark && "text-white drop-shadow-[0_0_2px_rgba(255,110,199,0.5)]",
            active && !isDark && "text-brand-dark",
            !active && isHovered && isDark && "text-brand-pink",
            !active && isHovered && !isDark && "text-brand-primary",
            !active && !isHovered && isDark && "text-white/80",
            !active && !isHovered && !isDark && "text-brand-dark/70",
          )} />
          <span className={clsx(
            "hidden lg:inline-block transition-colors duration-200",
            active && isDark && "text-white",
            active && !isDark && "text-brand-dark",
            !active && isHovered && isDark && "text-brand-pink",
            !active && isHovered && !isDark && "text-brand-primary",
            !active && !isHovered && isDark && "text-white/80",
            !active && !isHovered && !isDark && "text-brand-dark/70",
          )}>
            {label}
          </span>
          {showBadge && (
            <Badge className={clsx(
              "ml-auto text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] flex items-center justify-center",
              isDark 
                ? "bg-gradient-to-r from-brand-accent to-neon-magenta text-white shadow-[0_0_8px_rgba(255,110,199,0.2)]" 
                : "bg-gradient-to-r from-brand-primary to-brand-accent text-white"
            )}>
              {badgeCount}
            </Badge>
          )}
        </Button>
      </TooltipTrigger>
      {!active && isHovered && (
        <TooltipContent side="right" className="lg:hidden">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export function SidebarAvatar({
  name,
  avatarUrl,
  isDark = true,
}: {
  name: string;
  avatarUrl?: string;
  isDark?: boolean;
}) {
  return (
    <div className={clsx(
      "mt-auto px-4 py-5 flex items-center gap-3 border-t backdrop-blur-sm",
      isDark 
        ? "border-brand-primary/20 bg-gradient-to-r from-black/80 to-brand-dark/70" 
        : "border-brand-secondary/20 bg-white/50"
    )}>
      <Avatar className={clsx(
        "w-9 h-9 ring-2 ring-offset-1 shadow-md",
        isDark 
          ? "ring-brand-accent/60 ring-offset-black shadow-[0_0_10px_rgba(255,110,199,0.15)]" 
          : "ring-brand-secondary/60 ring-offset-white"
      )}>
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className={clsx(
          isDark 
            ? "bg-gradient-to-br from-brand-primary to-brand-accent text-white" 
            : "bg-gradient-to-br from-brand-secondary to-brand-blue text-brand-dark"
        )}>
          {name ? name.slice(0, 2).toUpperCase() : "PP"}
        </AvatarFallback>
      </Avatar>
      <div className="hidden lg:flex flex-col text-sm">
        <span className={clsx(
          "font-semibold line-clamp-1",
          isDark ? "text-white" : "text-brand-dark"
        )}>
          {name || "User"}
        </span>
        <span className={clsx(
          "text-xs font-medium",
          isDark ? "text-brand-accent/80" : "text-brand-primary/80"
        )}>
          Active
        </span>
      </div>
    </div>
  );
}
