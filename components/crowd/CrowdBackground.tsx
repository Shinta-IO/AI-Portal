// components/crowd/CrowdBackground.tsx
"use client";
import { motion } from "framer-motion";

export default function CrowdBackground() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-accent to-brand-blue opacity-10 sm:opacity-20 blur-3xl z-0"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
    />
  );
}
