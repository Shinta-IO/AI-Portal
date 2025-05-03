import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
    </div>
  );
}
