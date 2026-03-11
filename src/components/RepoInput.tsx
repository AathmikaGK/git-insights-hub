import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RepoInputProps {
  onSubmit: (owner: string, repo: string) => void;
  isLoading: boolean;
}

export function RepoInput({ onSubmit, isLoading }: RepoInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = value.trim().replace(/\/+$/, "");
    const urlMatch = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
    const slashMatch = cleaned.match(/^([^/]+)\/([^/]+)$/);

    if (urlMatch) {
      onSubmit(urlMatch[1], urlMatch[2].replace(/\.git$/, ""));
    } else if (slashMatch) {
      onSubmit(slashMatch[1], slashMatch[2]);
    } else {
      setError("Enter a valid GitHub URL or owner/repo format");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto glass-card gradient-border rounded-xl p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            placeholder="github.com/owner/repo or owner/repo"
            className="pl-11 h-11 md:h-12 bg-secondary/70 border-border font-display text-sm"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="h-11 md:h-12 px-6 font-display text-sm w-full sm:w-auto">
          {isLoading ? "Analyzing…" : "Analyze"}
        </Button>
      </div>
      {error && <p className="text-destructive text-sm mt-2 font-display">{error}</p>}
    </form>
  );
}
