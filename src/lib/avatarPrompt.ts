import { CommitActivity, LanguageBreakdown, RepoInfo } from "@/lib/github";

interface AvatarPromptOptions {
  commitActivity?: CommitActivity[];
  languages?: LanguageBreakdown;
  className?: string;
  title?: string;
  vibeRoast?: string;
}

const formatLanguages = (languages?: LanguageBreakdown) => {
  if (!languages || Object.keys(languages).length === 0) return "Unknown";

  const total = Object.values(languages).reduce((sum, n) => sum + n, 0);
  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, bytes]) => `${name} (${Math.round((bytes / total) * 100)}%)`)
    .join(", ");
};

const totalCommits = (activity?: CommitActivity[]) => (activity ?? []).reduce((sum, w) => sum + w.total, 0);

export function buildNanoBananaPrompt(repo: RepoInfo, options: AvatarPromptOptions = {}) {
  const prompt = [
    "Create an animated profile avatar for a software repository.",
    "Style: premium motion-graphics, high contrast, cinematic glow, loopable animation, transparent background.",
    "Model target: Gemini Nano Banana avatar generation.",
    "",
    `Repository: ${repo.full_name}`,
    `Description: ${repo.description ?? "No description"}`,
    `Owner: ${repo.owner.login}`,
    `Primary language: ${repo.language ?? "Unknown"}`,
    `Language mix: ${formatLanguages(options.languages)}`,
    `Stars (XP): ${repo.stargazers_count}`,
    `Forks: ${repo.forks_count}`,
    `Watchers: ${repo.watchers_count}`,
    `Open issues: ${repo.open_issues_count}`,
    `Total commits (recent yearly activity): ${totalCommits(options.commitActivity)}`,
    `Repo archetype/class: ${options.className ?? "Adaptive Engineer"}`,
    `Trait title: ${options.title ?? "Signal Caster"}`,
    `Vibe: ${options.vibeRoast ?? "Focused, futuristic, and battle-ready"}`,
    "",
    "Visual directives:",
    "- Color palette strictly black, electric blue, and violet.",
    "- Include a central emblem with owner initials + repo initials.",
    "- Add orbiting particles and pulsing rings that reflect activity level.",
    "- Add subtle code-rune glyphs and data sparks.",
    "- Keep face/logo area readable at 64x64.",
    "",
    "Output requirements:",
    "- Return a square avatar animation (1:1).",
    "- Provide web-ready exported asset suitable for embedding as image/gif/webp.",
  ].join("\n");

  return prompt;
}
