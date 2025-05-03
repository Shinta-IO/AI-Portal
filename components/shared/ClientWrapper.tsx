"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabaseClient } from "@/utils/supabaseClient";
import { useState } from "react";
import type { Session } from "@supabase/auth-helpers-nextjs";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => supabaseClient);

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}
