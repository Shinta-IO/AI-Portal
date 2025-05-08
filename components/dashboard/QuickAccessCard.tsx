// components/dashboard/QuickAccessCard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuickAccessCardProps {
  type: "estimates" | "invoices" | "crowd";
  userId: string;
}

export default function QuickAccessCard({ type, userId }: QuickAccessCardProps) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [count, setCount] = useState<number>(0);
  const [latestInvoiceUrl, setLatestInvoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      if (type === "estimates") {
        const { count } = await supabase
          .from("estimates")
          .select("id", { count: "exact" })
          .eq("user_id", userId)
          .eq("status", "pending");
        setCount(count || 0);
      }

      if (type === "invoices") {
        const { data } = await supabase
          .from("invoices")
          .select("id, status")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          setLatestInvoiceUrl(`/api/invoices/${data[0].id}/download`); // Adjust path as needed
        }

        const { count } = await supabase
          .from("invoices")
          .select("id", { count: "exact" })
          .eq("user_id", userId)
          .eq("status", "unpaid");
        setCount(count || 0);
      }

      if (type === "crowd") {
        const { count } = await supabase
          .from("crowd_projects")
          .select("id", { count: "exact" })
          .eq("is_visible", true)
          .eq("status", "open");
        setCount(count || 0);
      }
    };

    fetchData();
  }, [type, userId, supabase]);

  const titleMap = {
    estimates: "Estimates",
    invoices: "Invoices",
    crowd: "Crowd Projects",
  };

  const handlePrimaryAction = () => {
    if (type === "estimates") router.push("/estimates/new");
    if (type === "invoices" && latestInvoiceUrl) window.open(latestInvoiceUrl, "_blank");
    if (type === "crowd") router.push("/crowd");
  };

  const handleSecondaryAction = () => {
    if (type === "estimates") router.push("/estimates");
    if (type === "invoices") router.push("/invoices");
    if (type === "crowd") router.push("/crowd");
  };

  return (
    <Card className="p-4 shadow-sm flex flex-col justify-between">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{titleMap[type]}</h3>
          <Badge>{count}</Badge>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <Button onClick={handlePrimaryAction}>
            {type === "estimates" && "Request New"}
            {type === "invoices" && "Download Latest"}
            {type === "crowd" && "View Projects"}
          </Button>
          <Button variant="outline" onClick={handleSecondaryAction}>
            {type === "estimates" && "View All"}
            {type === "invoices" && "Go to Invoices"}
            {type === "crowd" && "Explore More"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
