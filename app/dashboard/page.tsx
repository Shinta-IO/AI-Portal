"use client";

import { useUser } from "@supabase/auth-helpers-react";
import { motion } from "framer-motion";
import { FileText, BarChart2, MessageSquare } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function DashboardPage() {
  const user = useUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen px-4 sm:px-8 py-12 bg-brand-light dark:bg-brand-dark transition-colors">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-accent to-brand-blue opacity-10 sm:opacity-20 blur-3xl z-0"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-brand-accent via-brand-primary to-brand-yellow text-transparent bg-clip-text">
            Welcome back, {user.email?.split("@")[0] || "User"}
          </h1>
          <p className="text-brand-muted dark:text-brand-blue mt-2">
            Let’s get productive — your tools are ready.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-accent mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "New Estimate",
                desc: "Start a service inquiry",
                icon: <FileText className="w-5 h-5 text-white" />,
                color: "from-brand-accent to-brand-primary",
              },
              {
                title: "Track Progress",
                desc: "View current project status",
                icon: <BarChart2 className="w-5 h-5 text-white" />,
                color: "from-brand-yellow to-brand-orange",
              },
              {
                title: "Inbox",
                desc: "Check your messages",
                icon: <MessageSquare className="w-5 h-5 text-white" />,
                color: "from-brand-blue to-brand-pink",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.04 }}
                className={`p-5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md hover:shadow-neon cursor-pointer transition-all`}
              >
                <div className="flex items-center gap-3">
                  {card.icon}
                  <h3 className="text-md font-semibold">{card.title}</h3>
                </div>
                <p className="text-sm mt-2 text-white/80">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
