// constants/navConfig.ts
import {
    Home, FolderKanban, FileText, FileEdit, Users2, MessageCircle, Settings
  } from "lucide-react";
  
  export const navTabs = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/projects", label: "Projects", icon: FolderKanban, table: "project_members" },
    { href: "/invoices", label: "Invoices", icon: FileText, table: "invoices" },
    { href: "/estimates", label: "Estimates", icon: FileEdit, table: "estimates" },
    { href: "/crowd", label: "Crowd Projects", icon: Users2, table: "crowd_participation" },
    { href: "/messages", label: "Messages", icon: MessageCircle, table: "messages" },
  ];
  
  export const adminTabs = [
    { href: "/admin", label: "Admin Panel", icon: Settings }
  ];
  