import { Contributor } from "@/lib/github";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ContributorListProps {
  data: Contributor[];
}

export function ContributorList({ data }: ContributorListProps) {
  const top10 = data.slice(0, 10);

  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-slide-up">
      <h3 className="text-sm font-display uppercase tracking-wider text-muted-foreground mb-4">
        Top Contributors
      </h3>
      <div className="h-56 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top10} layout="vertical">
            <XAxis
              type="number"
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="login"
              width={100}
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 14%, 20%)",
                borderRadius: "8px",
                fontFamily: "JetBrains Mono",
                fontSize: 12,
                color: "hsl(210, 20%, 92%)",
              }}
            />
            <Bar dataKey="contributions" fill="hsl(210, 90%, 55%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2">
        {top10.map((c) => (
          <a key={c.login} href={c.html_url} target="_blank" rel="noopener noreferrer" title={`${c.login} (${c.contributions})`}>
            <Avatar className="h-8 w-8 border border-border hover:border-primary transition-colors">
              <AvatarImage src={c.avatar_url} alt={c.login} />
              <AvatarFallback className="bg-secondary text-xs font-display">{c.login[0]}</AvatarFallback>
            </Avatar>
          </a>
        ))}
      </div>
    </div>
  );
}
