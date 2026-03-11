import { useState } from "react";
import { Star, GitFork, AlertCircle, Eye, Activity, GitCompare } from "lucide-react";
import { RepoInput } from "@/components/RepoInput";
import { StatCard } from "@/components/StatCard";
import { CommitTimeline } from "@/components/CommitTimeline";
import { LanguageChart } from "@/components/LanguageChart";
import { ContributorList } from "@/components/ContributorList";
import { RecentCommits } from "@/components/RecentCommits";
import { RepoHeader } from "@/components/RepoHeader";
import {
  fetchRepoInfo,
  fetchContributors,
  fetchCommitActivity,
  fetchLanguages,
  fetchRecentCommits,
  RepoInfo,
  Contributor,
  CommitActivity,
  LanguageBreakdown,
  CommitItem,
} from "@/lib/github";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface DashboardData {
  repo: RepoInfo;
  contributors: Contributor[];
  commitActivity: CommitActivity[];
  languages: LanguageBreakdown;
  recentCommits: CommitItem[];
}

const Index = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (owner: string, repo: string) => {
    setIsLoading(true);
    setData(null);

    try {
      const [repoInfo, contributors, commitActivity, languages, recentCommits] = await Promise.all([
        fetchRepoInfo(owner, repo),
        fetchContributors(owner, repo),
        fetchCommitActivity(owner, repo),
        fetchLanguages(owner, repo),
        fetchRecentCommits(owner, repo),
      ]);

      setData({
        repo: repoInfo,
        contributors,
        commitActivity,
        languages,
        recentCommits,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch repository data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border">
        <div className="container py-8 md:py-20 px-4">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse-glow" />
              <h1 className="text-2xl md:text-4xl font-bold font-display glow-text">
                GitPulse
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
              Visualize any GitHub repository's pulse — commits, contributors, languages, and more.
            </p>
          </div>
          <RepoInput onSubmit={handleAnalyze} isLoading={isLoading} />
          <div className="text-center mt-4">
            <Link to="/compare" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors font-display">
              <GitCompare className="h-4 w-4" />
              Compare two repos
            </Link>
          </div>
        </div>
      </header>

      {/* Loading */}
      {isLoading && (
        <div className="container py-20 text-center">
          <div className="inline-flex items-center gap-3 text-muted-foreground font-display">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Fetching repository data…
          </div>
        </div>
      )}

      {/* Dashboard */}
      {data && (
        <main className="container py-6 md:py-8 px-4 space-y-4 md:space-y-6">
          <RepoHeader repo={data.repo} />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <StatCard label="Stars" value={data.repo.stargazers_count} icon={Star} accent="amber" />
            <StatCard label="Forks" value={data.repo.forks_count} icon={GitFork} accent="blue" />
            <StatCard label="Issues" value={data.repo.open_issues_count} icon={AlertCircle} accent="purple" />
            <StatCard label="Watchers" value={data.repo.watchers_count} icon={Eye} accent="green" />
          </div>

          {/* Commit Timeline */}
          {data.commitActivity.length > 0 && (
            <CommitTimeline data={data.commitActivity} />
          )}

          {/* Two Column */}
          <div className="grid md:grid-cols-2 gap-6">
            {Object.keys(data.languages).length > 0 && (
              <LanguageChart data={data.languages} />
            )}
            {data.contributors.length > 0 && (
              <ContributorList data={data.contributors} />
            )}
          </div>

          {/* Recent Commits */}
          {data.recentCommits.length > 0 && (
            <RecentCommits data={data.recentCommits} repoFullName={data.repo.full_name} />
          )}

          {/* Footer */}
          <footer className="text-center py-6 text-xs text-muted-foreground font-display">
            Data sourced from GitHub's public API · Rate limits apply
          </footer>
        </main>
      )}
    </div>
  );
};

export default Index;
