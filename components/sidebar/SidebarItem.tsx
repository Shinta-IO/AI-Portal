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
}: SidebarItemProps) {
  const isHovered = hovered === href;
  const showBadge = badgeCount > 0;

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          variant={active ? "default" : "ghost"}
          onMouseEnter={() => setHovered(href)}
          onMouseLeave={() => setHovered(null)}
          className={clsx(
            "w-full justify-start gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
            active && (colorClass ?? "bg-brand-primary text-white"),
            !active &&
              (isHovered
                ? colorClass ?? "bg-muted text-brand-yellow"
                : "text-black dark:text-muted-foreground hover:bg-muted/50")
          )}
        >
          <Icon className="w-5 h-5" />
          <span className="hidden lg:inline-block text-black dark:text-white">
            {label}
          </span>
          {showBadge && (
            <Badge className="ml-auto text-xs font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
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
}: {
  name: string;
  avatarUrl?: string;
}) {
  return (
    <div className="mt-auto px-3 py-4 flex items-center gap-3 border-t border-muted bg-black/50">
      <Avatar>
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback>
          {name ? name.slice(0, 2).toUpperCase() : "PP"}
        </AvatarFallback>
      </Avatar>
      <div className="hidden lg:flex flex-col text-sm">
        <span className="font-semibold text-black dark:text-white line-clamp-1">
          {name || "User"}
        </span>
        <span className="text-muted-foreground">Active</span>
      </div>
    </div>
  );
}
