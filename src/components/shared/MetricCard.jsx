import React from "react";
import { ChevronRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: typeof ChevronRight;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
}

export default function MetricCard({ title, value, subtitle, icon: Icon = ChevronRight, trend, trendUp, onClick }: MetricCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:bg-white/90' : 'hover:shadow-md'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">{title}</p>
        <div className="p-3 rounded-2xl bg-background text-primary shadow-inner">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-bold text-foreground tracking-tight">{value}</p>
        {subtitle && <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>}
      </div>
      {trend && (
        <p className={`text-sm mt-3 font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      )}
    </div>
  );
}