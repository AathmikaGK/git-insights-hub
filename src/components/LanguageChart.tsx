import { LanguageBreakdown } from "@/lib/github";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface LanguageChartProps {
  data: LanguageBreakdown;
}

const COLORS = [
  "hsl(142, 71%, 45%)",
  "hsl(210, 90%, 55%)",
  "hsl(270, 60%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(187, 85%, 53%)",
];

export function LanguageChart({ data }: LanguageChartProps) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const chartData = Object.entries(data)
    .map(([name, bytes]) => ({ name, value: bytes, pct: ((bytes / total) * 100).toFixed(1) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 animate-slide-up">
      <h3 className="text-sm font-display uppercase tracking-wider text-muted-foreground mb-4">
        Languages
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(220, 18%, 12%)",
                  border: "1px solid hsl(220, 14%, 20%)",
                  borderRadius: "8px",
                  fontFamily: "JetBrains Mono",
                  fontSize: 12,
                  color: "hsl(210, 20%, 92%)",
                }}
                formatter={(value: number) => `${((value / total) * 100).toFixed(1)}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {chartData.map((lang, i) => (
            <div key={lang.name} className="flex items-center gap-3 text-sm">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="font-display text-foreground">{lang.name}</span>
              <span className="text-muted-foreground ml-auto font-display">{lang.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
