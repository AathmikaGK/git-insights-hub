import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "green" | "blue" | "purple" | "amber";
}

const accentMap = {
  green: "text-chart-green",
  blue: "text-chart-blue",
  purple: "text-chart-purple",
  amber: "text-chart-amber",
};

export function StatCard({ label, value, icon: Icon, accent = "green" }: StatCardProps) {
  return (
    <div className="glass-card gradient-border rounded-xl p-3 md:p-5 animate-slide-up shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-display">{label}</span>
        <Icon className={`h-4 w-4 ${accentMap[accent]}`} />
      </div>
      <p className={`text-xl md:text-2xl font-bold font-display ${accentMap[accent]}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
