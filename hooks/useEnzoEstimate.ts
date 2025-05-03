import { useState } from "react";

export function useEnzoEstimate() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runEnzo = async (estimateId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimateId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResponse(data.response);
    } catch (err: any) {
      setError(err.message);
      console.error("Enzo error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { runEnzo, loading, response, error };
}
