import { useState } from "react";
import { Sparkles, ClipboardCopy, Link2 } from "lucide-react";
import { RepoInfo, CommitActivity, LanguageBreakdown } from "@/lib/github";
import { buildNanoBananaPrompt } from "@/lib/avatarPrompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NanoBananaAvatarPanelProps {
  repo: RepoInfo;
  commitActivity?: CommitActivity[];
  languages?: LanguageBreakdown;
  repoClass?: string;
  title?: string;
  vibeRoast?: string;
  onAvatarUrlChange: (url: string) => void;
}

export function NanoBananaAvatarPanel({
  repo,
  commitActivity,
  languages,
  repoClass,
  title,
  vibeRoast,
  onAvatarUrlChange,
}: NanoBananaAvatarPanelProps) {
  const [avatarUrl, setAvatarUrl] = useState("");
  const prompt = buildNanoBananaPrompt(repo, { commitActivity, languages, className: repoClass, title, vibeRoast });

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // noop in restricted browsers
    }
  };

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-display uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Nano Banana Avatar
        </p>
        <Button size="sm" variant="ghost" onClick={copyPrompt} className="h-7 px-2 text-[11px] font-display">
          <ClipboardCopy className="h-3 w-3" /> Copy Prompt
        </Button>
      </div>

      <a
        href="https://gemini.google.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-primary hover:text-accent transition-colors font-display inline-flex items-center gap-1"
      >
        <Link2 className="h-3 w-3" /> Open Gemini Nano Banana
      </a>

      <Input
        placeholder="Paste generated avatar image URL"
        value={avatarUrl}
        onChange={(e) => {
          const value = e.target.value;
          setAvatarUrl(value);
          onAvatarUrlChange(value);
        }}
        className="h-8 text-xs bg-background/70"
      />
    </div>
  );
}
