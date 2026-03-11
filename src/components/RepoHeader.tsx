import { RepoInfo } from "@/lib/github";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface RepoHeaderProps {
  repo: RepoInfo;
}

export function RepoHeader({ repo }: RepoHeaderProps) {
  return (
    <div className="glass-card gradient-border rounded-xl p-4 md:p-6 animate-slide-up shadow-lg shadow-black/20">
      <div className="flex items-start gap-3 md:gap-4">
        <Avatar className="h-12 w-12 border border-border">
          <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
          <AvatarFallback className="bg-secondary font-display">{repo.owner.login[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg md:text-xl font-bold font-display text-foreground">{repo.full_name}</h2>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </a>
          </div>
          {repo.description && (
            <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {repo.language && (
              <Badge variant="secondary" className="font-display text-xs">{repo.language}</Badge>
            )}
            {repo.license && (
              <Badge variant="outline" className="font-display text-xs">{repo.license.name}</Badge>
            )}
            {repo.topics?.slice(0, 5).map((t) => (
              <Badge key={t} variant="outline" className="font-display text-xs">{t}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
