import { CommitActivity } from "@/lib/github";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CommitTimelineProps {
  data: CommitActivity[];
  title?: string;
}

export function CommitTimeline({ data, title }: CommitTimelineProps) {
  const chartData = data.map((week) => ({
    date: new Date(week.week * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    commits: week.total,
  }));

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 animate-slide-up">
      <h3 className="text-sm font-display uppercase tracking-wider text-muted-foreground mb-4">
        {title ? `${title} — Commit Activity` : "Commit Activity (Last Year)"}
      </h3>
      <div className="h-48 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              width={30}
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
            <Area
              type="monotone"
              dataKey="commits"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fill="url(#commitGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
