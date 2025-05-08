"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type CrowdProjectCardProps = {
  id: string;
  title: string;
  description: string;
  goal: number; // in dollars
  current: number; // in dollars
  joined: boolean;
  onView: () => void;
  onJoin: () => void;
};

const formatDollars = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);

export default function CrowdProjectCard({
  title,
  description,
  goal,
  current,
  joined,
  onView,
  onJoin,
}: CrowdProjectCardProps) {
  const progress = Math.min(100, (current / goal) * 100);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={() => {
        if (joined) onJoin();
        else onView();
      }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-brand-muted dark:border-brand-blue bg-white dark:bg-zinc-900 p-6 shadow transition-colors duration-300 hover:shadow-neon"
    >
      <h2 className="text-xl font-heading font-bold text-brand-primary dark:text-brand-accent mb-1">
        {title}
      </h2>

      <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4 line-clamp-3">
        {description}
      </p>

      <div className="mb-4">
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-2 bg-brand-yellow transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
          {formatDollars(current)} of {formatDollars(goal)} funded
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        className="w-full py-2 text-sm font-semibold rounded-md transition-all duration-300 flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-accent"
      >
        Learn More
      </button>
    </motion.div>
  );
}
