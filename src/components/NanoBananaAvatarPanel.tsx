import { useMemo, useState } from "react";
import { Sparkles, ClipboardCopy, Link2, WandSparkles } from "lucide-react";
import { RepoInfo, CommitActivity, LanguageBreakdown } from "@/lib/github";
import { buildGeneratedDescription, buildNanoBananaPrompt } from "@/lib/avatarPrompt";
import { generateNanoBananaAvatar } from "@/lib/nanoBanana";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [apiKey, setApiKey] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const generatedDescription = useMemo(
    () => buildGeneratedDescription(repo, { commitActivity, languages, className: repoClass, title, vibeRoast }),
    [repo, commitActivity, languages, repoClass, title, vibeRoast],
  );

  const prompt = useMemo(
    () => buildNanoBananaPrompt(repo, { commitActivity, languages, className: repoClass, title, vibeRoast }),
    [repo, commitActivity, languages, repoClass, title, vibeRoast],
  );

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setError("");
    } catch {
      setError("Clipboard access is blocked in this browser session.");
    }
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError("Enter your Nano Banana API key to generate an avatar.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const generated = await generateNanoBananaAvatar(apiKey.trim(), prompt);
      setAvatarUrl(generated);
      onAvatarUrlChange(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate avatar.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-2.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-display uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Nano Banana Avatar
        </p>
        <Button size="sm" variant="ghost" onClick={copyPrompt} className="h-7 px-2 text-[11px] font-display">
          <ClipboardCopy className="h-3 w-3" /> Copy Prompt
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Generated description: <span className="text-foreground">{generatedDescription}</span>
      </p>

      <Textarea
        readOnly
        value={prompt}
        className="min-h-[92px] text-[11px] bg-background/70 font-mono"
      />

      <a
        href="https://gemini.google.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-primary hover:text-accent transition-colors font-display inline-flex items-center gap-1"
      >
        <Link2 className="h-3 w-3" /> Open Gemini Nano Banana
      </a>

      <Input
        type="password"
        placeholder="Enter Nano Banana API key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="h-8 text-xs bg-background/70"
      />

      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-8 text-xs font-display bg-gradient-to-r from-primary to-accent"
        >
          <WandSparkles className="h-3.5 w-3.5" /> {isGenerating ? "Generating…" : "Generate via API"}
        </Button>

        <Input
          placeholder="Or paste generated avatar image URL"
          value={avatarUrl}
          onChange={(e) => {
            const value = e.target.value;
            setAvatarUrl(value);
            onAvatarUrlChange(value);
          }}
          className="h-8 text-xs bg-background/70"
        />
      </div>

      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
