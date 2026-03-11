import { useMemo, useState, type ReactNode } from "react";
import { Sword, Shield, Zap, Sparkles, ArrowLeft, GitCompare, Flame, Skull } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommitTimeline } from "@/components/CommitTimeline";
import { LanguageChart } from "@/components/LanguageChart";
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
import { RepoAuraAvatar } from "@/components/RepoAuraAvatar";

interface CompareData {
  repo: RepoInfo;
  commitActivity: CommitActivity[];
  languages: LanguageBreakdown;
}

interface BattleStats {
  health: number;
  agility: number;
  damage: number;
  defense: number;
  xp: number;
  className: string;
  title: string;
  vibeScore: number;
  vibeRoast: string;
}

const toScale = (value: number, factor: number, cap = 100) =>
  Math.min(cap, Math.max(5, Math.round(Math.log10(value + 1) * factor)));

const totalCommits = (activity: CommitActivity[]) => activity.reduce((sum, w) => sum + w.total, 0);

const buildBattleStats = (data: CompareData): BattleStats => {
  const commits = totalCommits(data.commitActivity);
  const stars = data.repo.stargazers_count;
  const issues = data.repo.open_issues_count;
  const watchers = data.repo.watchers_count;
  const forks = data.repo.forks_count;

  const agility = toScale(commits, 28);
  const damage = toScale(issues, 30);
  const defense = toScale(forks + watchers, 23);
  const health = Math.min(100, Math.round(35 + agility * 0.2 + defense * 0.45 + toScale(data.repo.size, 8) * 0.2));
  const xp = stars;

  const className =
    stars > 5000 ? "The Titan" :
    commits > 2000 && issues < 100 ? "The Ghost" :
    issues > 500 ? "The Berserker" :
    watchers > forks ? "The Sentinel" :
    "The Wanderer";

  const title =
    commits > 1200 ? "Velocity Forged" :
    issues > 300 ? "Battle-Scarred" :
    stars > 1000 ? "Legend-Seeking" :
    "Rising Challenger";

  const vibeScore = Math.max(1, Math.min(10, Math.round((agility * 0.35 + defense * 0.25 + Math.min(100, stars / 40) * 0.4) / 10)));

  const vibeRoast =
    vibeScore >= 8
      ? "Main-character energy. Ships features before your coffee cools."
      : vibeScore >= 5
        ? "Solid party member. Reliable, but still reading from the spellbook."
        : "Chaotic apprentice aura. Bold commits, mysterious consequences.";

  return { health, agility, damage, defense, xp, className, title, vibeScore, vibeRoast };
};

const getAvatarRune = (repo: RepoInfo, stats: BattleStats) => {
  const first = repo.name.charAt(0).toUpperCase();
  const second = repo.owner.login.charAt(0).toUpperCase();
  const crest = `${first}${second}`;
  const aura = stats.className.includes("Titan")
    ? "from-chart-amber/70 to-chart-red/60"
    : stats.className.includes("Ghost")
      ? "from-chart-cyan/70 to-chart-blue/60"
      : "from-primary/70 to-accent/60";

  return { crest, aura };
};

const Compare = () => {
  const [repoA, setRepoA] = useState("");
  const [repoB, setRepoB] = useState("");
  const [dataA, setDataA] = useState<CompareData | null>(null);
  const [dataB, setDataB] = useState<CompareData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [duelMode, setDuelMode] = useState(false);
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
    setDuelMode(false);
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

  const statsA = useMemo(() => (dataA ? buildBattleStats(dataA) : null), [dataA]);
  const statsB = useMemo(() => (dataB ? buildBattleStats(dataB) : null), [dataB]);

  return (
    <div className="page-shell">
      <header className="aurora-header border-b border-border/70 rounded-b-3xl">
        <div className="container py-8 md:py-12 px-0 sm:px-2 space-y-5">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <GitCompare className="h-5 w-5 text-accent animate-pulse-glow" />
            <h1 className="text-2xl md:text-3xl font-bold font-display glow-text">Repo Duel Arena</h1>
          </div>

          <form onSubmit={handleCompare} className="glass-card gradient-border rounded-xl p-3 sm:p-4 space-y-3 md:space-y-0 md:flex md:gap-3 md:items-end">
            <EngulfInput label="Combatant A" value={repoA} setValue={setRepoA} disabled={isLoading} />
            <EngulfInput label="Combatant B" value={repoB} setValue={setRepoB} disabled={isLoading} />
            <Button type="submit" disabled={isLoading} className="h-11 px-6 font-display text-sm w-full md:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground">
              {isLoading ? "Summoning Data…" : "Materialize Combatants"}
            </Button>
          </form>
        </div>
      </header>

      {isLoading && (
        <div className="container py-16 text-center">
          <div className="inline-flex items-center gap-3 text-muted-foreground font-display">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Conjuring repository energy…
          </div>
        </div>
      )}

      {dataA && dataB && statsA && statsB && (
        <main className="container py-6 px-0 sm:px-2 space-y-6 battle-materialize">
          <div className={`glass-card gradient-border rounded-2xl p-4 md:p-6 shadow-xl shadow-black/35 ${duelMode ? "duel-cinematic" : ""}`}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="font-display text-base md:text-lg uppercase tracking-wider text-muted-foreground">RPG Battle Screen</h2>
              <Button onClick={() => setDuelMode((d) => !d)} className="font-display bg-gradient-to-r from-chart-red via-accent to-primary">
                <Sword className="h-4 w-4 mr-2" /> Duel
              </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <BattleCard side="left" data={dataA} stats={statsA} rival={statsB} duelMode={duelMode} />
              <div className="hidden xl:flex items-center justify-center text-accent font-display text-2xl">VS</div>
              <BattleCard side="right" data={dataB} stats={statsB} rival={statsA} duelMode={duelMode} />
            </div>
          </div>


          <div className="glass-card gradient-border rounded-xl p-3 text-xs font-display text-muted-foreground">
            RPG Mapping: <span className="text-foreground">Commits → Agility</span> · <span className="text-foreground">Issues → Damage</span> · <span className="text-foreground">Forks + Watchers → Defense</span> · <span className="text-foreground">Stars → XP</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dataA.commitActivity.length > 0 && <CommitTimeline data={dataA.commitActivity} title={`${dataA.repo.name} (Agility Source)`} />}
            {dataB.commitActivity.length > 0 && <CommitTimeline data={dataB.commitActivity} title={`${dataB.repo.name} (Agility Source)`} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(dataA.languages).length > 0 && <LanguageChart data={dataA.languages} />}
            {Object.keys(dataB.languages).length > 0 && <LanguageChart data={dataB.languages} />}
          </div>
        </main>
      )}
    </div>
  );
};

function EngulfInput({
  label,
  value,
  setValue,
  disabled,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  disabled: boolean;
}) {
  const filled = value.trim().length > 0;

  return (
    <div className="flex-1">
      <label className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1 block">{label}</label>
      <div className={`repo-engulf rounded-lg ${filled ? "repo-engulf--active" : ""}`}>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="owner/repo or GitHub URL"
          className="h-11 bg-secondary/70 border-border font-display text-sm"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function BattleCard({
  data,
  stats,
  rival,
  duelMode,
  side,
}: {
  data: CompareData;
  stats: BattleStats;
  rival: BattleStats;
  duelMode: boolean;
  side: "left" | "right";
}) {
  const winner = stats.health + stats.defense + stats.agility > rival.health + rival.defense + rival.agility;
  const rune = getAvatarRune(data.repo, stats);
  const healthWidth = duelMode ? Math.max(7, stats.health - Math.round(rival.damage * 0.25)) : stats.health;

  return (
    <section className={`glass-card gradient-border rounded-xl p-4 md:p-5 space-y-4 ${duelMode ? "battle-shake" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <RepoAuraAvatar repo={data.repo} />
          <div className={`absolute -bottom-2 -right-2 h-7 w-7 rounded-full grid place-items-center text-[10px] font-display font-bold bg-gradient-to-br ${rune.aura} text-white border border-white/40`}>
            {rune.crest}
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-base md:text-lg truncate">{data.repo.full_name}</h3>
          <p className="text-xs text-muted-foreground">{stats.className} • {stats.title}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-display mb-1 text-muted-foreground">
          <span>HP</span>
          <span>{healthWidth}/100</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${winner ? "bg-gradient-to-r from-primary to-chart-cyan" : "bg-gradient-to-r from-chart-red to-chart-amber"}`} style={{ width: `${healthWidth}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-display">
        <StatPill icon={<Zap className="h-3 w-3" />} label="Agility" value={stats.agility} />
        <StatPill icon={<Flame className="h-3 w-3" />} label="Damage" value={stats.damage} />
        <StatPill icon={<Shield className="h-3 w-3" />} label="Defense" value={stats.defense} />
        <StatPill icon={<Sparkles className="h-3 w-3" />} label="XP (Stars)" value={stats.xp.toLocaleString()} />
      </div>

      <div className="rounded-lg bg-secondary/60 border border-border p-3 text-xs">
        <p className="font-display text-muted-foreground uppercase tracking-wider mb-1">Vibe Meter (LLM Roast)</p>
        <p className="font-display text-foreground">{stats.vibeScore}/10 • {stats.vibeRoast}</p>
      </div>

      <div className={`text-xs font-display ${winner ? "text-primary" : "text-chart-red"} flex items-center gap-2`}>
        {winner ? <Sword className="h-3.5 w-3.5" /> : <Skull className="h-3.5 w-3.5" />}
        {duelMode ? (winner ? "Critical strike potential detected." : "Taking heavy damage under duel simulation.") : `Position: ${side === "left" ? "North" : "South"} platform`}
      </div>
    </section>
  );
}

function StatPill({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-secondary/50 border border-border px-2.5 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 text-muted-foreground">{icon}<span>{label}</span></div>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export default Compare;
