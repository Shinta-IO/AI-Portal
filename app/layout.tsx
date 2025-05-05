// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { SupabaseProvider } from "@/lib/supabase/SupabaseContext";
import FloatingEnzo from "@/components/ai/FloatingEnzo";

export const metadata: Metadata = {
  title: "Pixel Pro Portal",
  description: "Collaboration and commissioning platform for digital services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-brand-light dark:bg-brand-dark text-black dark:text-white transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SupabaseProvider>
            {children}
            <FloatingEnzo />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
