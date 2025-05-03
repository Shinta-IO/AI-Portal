"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ClientDashboard() {
  const cards = [
    {
      title: "Estimates",
      desc: "Request a new estimate or track pending ones.",
      href: "/estimates",
      gradient: "from-brand-primary to-brand-pink",
    },
    {
      title: "Projects",
      desc: "Monitor timelines and approve milestones.",
      href: "/projects",
      gradient: "from-brand-accent to-brand-yellow",
    },
    {
      title: "Invoices",
      desc: "View, pay, or download your invoice history.",
      href: "/invoices",
      gradient: "from-brand-blue to-brand-orange",
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
        className="text-4xl font-heading font-bold text-center bg-gradient-to-r from-brand-primary via-brand-accent to-brand-blue text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to Pixel Pro Portal
      </motion.h1>

      <p className="text-center text-brand-muted dark:text-brand-blue mt-2 max-w-xl mx-auto">
        All your projects, estimates, and invoices in one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {cards.map((card, i) => (
          <Link href={card.href} key={i}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`cursor-pointer p-6 rounded-2xl bg-white/60 dark:bg-black/30 border border-brand-muted dark:border-brand-accent shadow-md hover:shadow-neon transition-all backdrop-blur-md`}
            >
              <h2
                className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
              >
                {card.title}
              </h2>
              <p className="text-sm text-brand-muted dark:text-gray-400 mt-2">
                {card.desc}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Copilot placeholder */}
      <div className="text-center mt-20 opacity-75">
        <Sparkles className="mx-auto mb-2 animate-glow text-brand-accent" />
        <p className="text-sm text-brand-muted">Copilot suggestions coming soon...</p>
      </div>
    </motion.div>
  );
}
