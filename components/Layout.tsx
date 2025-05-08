"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/sidebar/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-16 lg:ml-64 flex flex-col">
        <Header />
        {/* Apply padding-top to offset fixed Header height (e.g., 64px = pt-16) */}
        <div className="flex-1 pt-16 px-4 lg:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
