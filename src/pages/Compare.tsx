import { useState } from "react";
import { Star, GitFork, AlertCircle, Eye, Activity, ArrowLeft, GitCompare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { CommitTimeline } from "@/components/CommitTimeline";
import { LanguageChart } from "@/components/LanguageChart";
import { RepoHeader } from "@/components/RepoHeader";
import {
  fetchRepoInfo,
  fetchCommitActivity,
  fetchLanguages,
  parseRepoUrl,
  RepoInfo,
  CommitActivity,
  LanguageBreakdown,
} from "@/lib/github";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface CompareData {
  repo: RepoInfo;
  commitActivity: CommitActivity[];
  languages: LanguageBreakdown;
}

const Compare = () => {
  const [repoA, setRepoA] = useState("");
  const [repoB, setRepoB] = useState("");
  const [dataA, setDataA] = useState<CompareData | null>(null);
  const [dataB, setDataB] = useState<CompareData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRepo = async (input: string): Promise<CompareData | null> => {
    const parsed = parseRepoUrl(input);
    if (!parsed) {
      toast({ title: "Invalid input", description: `"${input}" is not a valid repo format`, variant: "destructive" });
      return null;
    }
    const [repo, commitActivity, languages] = await Promise.all([
      fetchRepoInfo(parsed.owner, parsed.repo),
      fetchCommitActivity(parsed.owner, parsed.repo),
      fetchLanguages(parsed.owner, parsed.repo),
    ]);
    return { repo, commitActivity, languages };
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDataA(null);
    setDataB(null);
    try {
      const [a, b] = await Promise.all([fetchRepo(repoA), fetchRepo(repoB)]);
      if (a) setDataA(a);
      if (b) setDataB(b);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to fetch data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = (d: CompareData) => [
    { label: "Stars", value: d.repo.stargazers_count, icon: Star, accent: "amber" as const },
    { label: "Forks", value: d.repo.forks_count, icon: GitFork, accent: "blue" as const },
    { label: "Issues", value: d.repo.open_issues_count, icon: AlertCircle, accent: "purple" as const },
    { label: "Watchers", value: d.repo.watchers_count, icon: Eye, accent: "green" as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container py-8 md:py-12">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <GitCompare className="h-5 w-5 text-accent animate-pulse-glow" />
            <h1 className="text-2xl md:text-3xl font-bold font-display glow-text">Compare Repos</h1>
          </div>
          <form onSubmit={handleCompare} className="space-y-3 md:space-y-0 md:flex md:gap-3 md:items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1 block">Repository A</label>
              <Input
                value={repoA}
                onChange={(e) => setRepoA(e.target.value)}
                placeholder="owner/repo or GitHub URL"
                className="h-11 bg-secondary border-border font-display text-sm"
                disabled={isLoading}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1 block">Repository B</label>
              <Input
                value={repoB}
                onChange={(e) => setRepoB(e.target.value)}
                placeholder="owner/repo or GitHub URL"
                className="h-11 bg-secondary border-border font-display text-sm"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="h-11 px-6 font-display text-sm w-full md:w-auto">
              {isLoading ? "Comparing…" : "Compare"}
            </Button>
          </form>
        </div>
      </header>

      {isLoading && (
        <div className="container py-16 text-center">
          <div className="inline-flex items-center gap-3 text-muted-foreground font-display">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Fetching repositories…
          </div>
        </div>
      )}

      {dataA && dataB && (
        <main className="container py-6 space-y-6">
          {/* Headers side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RepoHeader repo={dataA.repo} />
            <RepoHeader repo={dataB.repo} />
          </div>

          {/* Stats comparison */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats(dataA).map((s) => (
              <StatCard key={`a-${s.label}`} {...s} />
            ))}
          </div>
          <div className="text-center text-xs text-muted-foreground font-display uppercase tracking-wider">vs</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats(dataB).map((s) => (
              <StatCard key={`b-${s.label}`} {...s} />
            ))}
          </div>

          {/* Stat bars comparison */}
          <ComparisonBars dataA={dataA} dataB={dataB} />

          {/* Timelines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dataA.commitActivity.length > 0 && <CommitTimeline data={dataA.commitActivity} title={dataA.repo.name} />}
            {dataB.commitActivity.length > 0 && <CommitTimeline data={dataB.commitActivity} title={dataB.repo.name} />}
          </div>

          {/* Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(dataA.languages).length > 0 && <LanguageChart data={dataA.languages} />}
            {Object.keys(dataB.languages).length > 0 && <LanguageChart data={dataB.languages} />}
          </div>

          <footer className="text-center py-6 text-xs text-muted-foreground font-display">
            Data sourced from GitHub's public API · Rate limits apply
          </footer>
        </main>
      )}
    </div>
  );
};

function ComparisonBars({ dataA, dataB }: { dataA: CompareData; dataB: CompareData }) {
  const metrics = [
    { label: "Stars", a: dataA.repo.stargazers_count, b: dataB.repo.stargazers_count, color: "bg-chart-amber" },
    { label: "Forks", a: dataA.repo.forks_count, b: dataB.repo.forks_count, color: "bg-chart-blue" },
    { label: "Issues", a: dataA.repo.open_issues_count, b: dataB.repo.open_issues_count, color: "bg-chart-purple" },
    { label: "Size (KB)", a: dataA.repo.size, b: dataB.repo.size, color: "bg-chart-cyan" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 animate-slide-up">
      <h3 className="text-sm font-display uppercase tracking-wider text-muted-foreground mb-4">Head to Head</h3>
      <div className="space-y-4">
        {metrics.map((m) => {
          const max = Math.max(m.a, m.b, 1);
          return (
            <div key={m.label}>
              <div className="flex justify-between text-xs font-display text-muted-foreground mb-1">
                <span>{dataA.repo.name}: {m.a.toLocaleString()}</span>
                <span className="text-foreground">{m.label}</span>
                <span>{dataB.repo.name}: {m.b.toLocaleString()}</span>
              </div>
              <div className="flex gap-1 h-3">
                <div className={`${m.color} rounded-l-sm transition-all duration-700`} style={{ width: `${(m.a / max) * 50}%` }} />
                <div className={`${m.color} opacity-60 rounded-r-sm transition-all duration-700 ml-auto`} style={{ width: `${(m.b / max) * 50}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Compare;
