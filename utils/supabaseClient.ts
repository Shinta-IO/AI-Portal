// utils/supabaseClient.ts
"use client";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { type Database } from "@/types"; 

export const supabaseClient = createPagesBrowserClient<Database>();
