import { useMemo, useState } from "react";
import { Sparkles, Video, Loader2 } from "lucide-react";
import { RepoInfo, CommitActivity, LanguageBreakdown } from "@/lib/github";
import { buildNanoBananaPrompt } from "@/lib/avatarPrompt";
import { Button } from "@/components/ui/button";

interface NanoBananaAvatarPanelProps {
  repo: RepoInfo;
  commitActivity?: CommitActivity[];
  languages?: LanguageBreakdown;
  repoClass?: string;
  title?: string;
  vibeRoast?: string;
}

export function NanoBananaAvatarPanel({
  repo,
  commitActivity,
  languages,
  repoClass,
  title,
  vibeRoast,
}: NanoBananaAvatarPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [mediaType, setMediaType] = useState<"video" | "image" | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");

  const prompt = useMemo(
    () => buildNanoBananaPrompt(repo, { commitActivity, languages, className: repoClass, title, vibeRoast }),
    [repo, commitActivity, languages, repoClass, title, vibeRoast],
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    setWarning("");

    try {
      const res = await fetch("/api/nano-banana-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? `Video generation failed (${res.status})`);
      }

      if (!data?.mediaDataUrl || !data?.mediaType) {
        throw new Error("Nano Banana did not return playable media.");
      }

      setMediaType(data.mediaType);
      setMediaUrl(data.mediaDataUrl);
      if (data.warning) setWarning(data.warning);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate video.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-2.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-display uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Nano Banana Video
        </p>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="sm"
          className="h-7 px-2 text-[11px] font-display bg-gradient-to-r from-primary to-accent"
        >
          {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
          {isGenerating ? "Generating…" : "Generate Video"}
        </Button>
      </div>

      {mediaUrl && mediaType === "video" ? (
        <video
          key={mediaUrl}
          controls
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-md border border-border bg-background/60 max-h-56 object-cover"
          src={mediaUrl}
        />
      ) : mediaUrl && mediaType === "image" ? (
        <img
          src={mediaUrl}
          alt="Nano Banana generated media"
          className="w-full rounded-md border border-border bg-background/60 max-h-56 object-cover"
        />
      ) : (
        <div className="w-full rounded-md border border-dashed border-border/70 bg-background/40 px-3 py-4 text-[11px] text-muted-foreground font-display">
          Generate to display Nano Banana video here.
        </div>
      )}

      {warning && <p className="text-[11px] text-amber-300">{warning}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
