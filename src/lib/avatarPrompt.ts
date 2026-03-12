import { CommitActivity, LanguageBreakdown, RepoInfo } from "@/lib/github";

interface AvatarPromptOptions {
  commitActivity?: CommitActivity[];
  languages?: LanguageBreakdown;
  className?: string;
  title?: string;
  vibeRoast?: string;
}

const languageStyleMap: Record<string, string> = {
  python: "robes embroidered with snakes, green and blue palette",
  javascript: "neon trickster cloak with electric yellow-blue glyphs",
  typescript: "precise blue-violet arcane armor with geometric sigils",
  java: "monastic battlemage robes with ember runes",
  go: "minimal tactical coat, cyan circuitry accents",
  rust: "forged iron-red plated armor with oxidized trim",
  c: "vintage engineer harness with raw metal plates",
  "c++": "heavy mechanist armor with intricate cog motifs",
  csharp: "clean silver-violet paladin armor",
  ruby: "crimson enchanter cape with jewel shards",
  php: "midnight wizard robes with soft violet glow",
  kotlin: "sleek gradient mantle, magenta-indigo accents",
  swift: "wind runner leathers with luminous orange highlights",
};

const totalCommits = (activity?: CommitActivity[]) => (activity ?? []).reduce((sum, w) => sum + w.total, 0);

const getTopLanguage = (repo: RepoInfo, languages?: LanguageBreakdown) => {
  if (repo.language) return repo.language;
  if (!languages || Object.keys(languages).length === 0) return "Unknown";
  return Object.entries(languages).sort((a, b) => b[1] - a[1])[0][0];
};

const getRepoAgeYears = (createdAt: string) => Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365));

export function buildGeneratedDescription(repo: RepoInfo, options: AvatarPromptOptions = {}) {
  const topLanguage = getTopLanguage(repo, options.languages);
  const languageKey = topLanguage.toLowerCase();
  const languageVisual = languageStyleMap[languageKey] ?? `signature ${topLanguage} glyphs in blue-violet lighting`;

  const commits = totalCommits(options.commitActivity);
  const commitVisual =
    commits > 5000
      ? "heavy, worn armor, muscular build, scars from battle"
      : commits > 1800
        ? "seasoned armor with polished dents and veteran posture"
        : "light explorer armor with fresh, adaptable plating";

  const ageYears = getRepoAgeYears(repo.created_at);
  const ageVisual =
    ageYears > 6
      ? "long white beard, ancient glowing staff, floating runes"
      : ageYears > 3
        ? "mature arcane cloak with elder insignias"
        : "young prodigy silhouette with bright kinetic runes";

  const issueVisual =
    repo.open_issues_count > 250
      ? "surrounded by small glitch-demons, cracked shield"
      : repo.open_issues_count > 80
        ? "flickering static wisps and chipped gauntlets"
        : "clean barrier shield with minimal corruption";

  const starsVisual =
    repo.stargazers_count > 5000
      ? "radiant golden aura, crowd cheering in background"
      : repo.stargazers_count > 1000
        ? "bright ceremonial aura with spotlight beams"
        : "subtle blue-violet aura with rising stardust";

  const extras = [
    options.className ? `class archetype: ${options.className}` : null,
    options.title ? `title: ${options.title}` : null,
    options.vibeRoast ? `personality tone: ${options.vibeRoast}` : null,
  ].filter(Boolean);

  return [
    `${repo.full_name} as a heroic character`,
    `${languageVisual}`,
    `${commitVisual}`,
    `${ageVisual}`,
    `${issueVisual}`,
    `${starsVisual}`,
    ...extras,
  ].join(", ");
}

export function buildNanoBananaPrompt(repo: RepoInfo, options: AvatarPromptOptions = {}) {
  const generatedDescription = buildGeneratedDescription(repo, options);
  return `A video game character sheet of ${generatedDescription}. The character is standing in a neutral 'A-Pose'. Front view, side view, and back view. Flat lighting, neutral grey background, 4k resolution, cel-shaded style.`;
}
