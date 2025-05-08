import {
  Home,
  FolderKanban,
  FileText,
  FileEdit,
  Users2, // ✅ Use this, not "Users"
  MessageCircle,
  Settings,
} from "lucide-react";

export const navTabs = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/estimates", label: "Estimates", icon: FileEdit },
  { href: "/crowd", label: "Crowd Projects", icon: Users2 },
  { href: "/messages", label: "Messages", icon: MessageCircle },
];

export const adminTabs = [
  { href: "/admin", label: "Admin Panel", icon: Settings }
];
