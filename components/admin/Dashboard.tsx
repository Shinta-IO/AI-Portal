"use client";

import { motion } from "framer-motion";
import { Gauge, FileText, Users2, FolderKanban } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const sections = [
    {
      label: "Estimates",
      description: "View and respond to client estimate requests.",
      href: "/estimates",
      icon: <FileText className="w-6 h-6 text-white" />,
      gradient: "from-brand-primary to-brand-accent",
    },
    {
      label: "Projects",
      description: "Manage timelines, assignments, and delivery.",
      href: "/projects",
      icon: <FolderKanban className="w-6 h-6 text-white" />,
      gradient: "from-brand-yellow to-brand-orange",
    },
    {
      label: "Invoices",
      description: "Track payments and send reminders.",
      href: "/invoices",
      icon: <Gauge className="w-6 h-6 text-white" />,
      gradient: "from-brand-blue to-brand-pink",
    },
    {
      label: "Users",
      description: "View client activity and manage roles.",
      href: "/settings", // could eventually be /admin/users
      icon: <Users2 className="w-6 h-6 text-white" />,
      gradient: "from-brand-accent to-brand-blue",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-brand-light dark:bg-brand-dark px-6 py-12 transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        className="text-4xl font-heading font-bold text-center bg-gradient-to-r from-brand-accent via-brand-primary to-brand-blue text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Admin Control Center
      </motion.h1>

      <p className="text-center text-brand-muted dark:text-brand-blue mt-2 max-w-xl mx-auto">
        Manage your team’s workflow, client activity, and operational status.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {sections.map((section, i) => (
          <Link href={section.href} key={i}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              className={`p-5 rounded-xl bg-gradient-to-br ${section.gradient} text-white shadow-xl hover:shadow-neon cursor-pointer transition-all`}
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <h2 className="text-xl font-bold">{section.label}</h2>
              </div>
              <p className="text-sm text-white/80 mt-2">{section.description}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
