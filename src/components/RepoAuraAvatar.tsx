import type { CSSProperties } from "react";
import { RepoInfo } from "@/lib/github";

interface RepoAuraAvatarProps {
  repo: RepoInfo;
  size?: "sm" | "md";
}

export function RepoAuraAvatar({ repo, size = "md" }: RepoAuraAvatarProps) {
  const energy = Math.min(100, repo.stargazers_count + repo.forks_count + repo.watchers_count);
  const orbitMs = 2800 - Math.min(1800, Math.floor(energy * 8));
  const ringOpacity = 0.2 + Math.min(0.45, energy / 220);
  const initials = `${repo.owner.login.charAt(0)}${repo.name.charAt(0)}`.toUpperCase();
  const dimensions = size === "sm" ? "h-10 w-10" : "h-14 w-14";

  const auraStyle = { "--orbit-duration": `${orbitMs}ms` } as CSSProperties;

  return (
    <div className={`repo-aura ${dimensions}`} style={auraStyle}>
      <div className="repo-aura__ring" style={{ opacity: ringOpacity }} />
      <img src={repo.owner.avatar_url} alt={repo.owner.login} className="repo-aura__img" />
      <div className="repo-aura__badge">{initials}</div>
      <div className="repo-aura__orb" />
    </div>
  );
}
