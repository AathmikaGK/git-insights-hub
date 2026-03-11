import { CommitItem } from "@/lib/github";
import { GitCommit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecentCommitsProps {
  data: CommitItem[];
  repoFullName: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function RecentCommits({ data, repoFullName }: RecentCommitsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 animate-slide-up">
      <h3 className="text-sm font-display uppercase tracking-wider text-muted-foreground mb-4">
        Recent Commits
      </h3>
      <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
        {data.map((commit, i) => (
          <div key={commit.sha} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
            <div className="relative mt-1">
              <GitCommit className="h-4 w-4 text-primary" />
              {i < data.length - 1 && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-px h-6 bg-border" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <a
                href={`https://github.com/${repoFullName}/commit/${commit.sha}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                {commit.commit.message.split("\n")[0]}
              </a>
              <div className="flex items-center gap-2 mt-1">
                {commit.author && (
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={commit.author.avatar_url} />
                    <AvatarFallback className="text-[8px] bg-secondary">{commit.author.login[0]}</AvatarFallback>
                  </Avatar>
                )}
                <span className="text-xs text-muted-foreground font-display">
                  {commit.commit.author.name}
                </span>
                <span className="text-xs text-muted-foreground font-display">
                  {timeAgo(commit.commit.author.date)}
                </span>
                <span className="text-xs text-muted-foreground font-display ml-auto">
                  {commit.sha.slice(0, 7)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
