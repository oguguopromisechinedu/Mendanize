"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

import type { AnalyticsChartCard } from "../types/types";

function MiniSparkline({ chart }: { chart: AnalyticsChartCard }) {
  const gradientId = `chart-grad-${chart.id}`;
  const isNegativeGood =
    chart.label === "Bounce Rate" && chart.delta.startsWith("-");

  const deltaTone =
    chart.delta.startsWith("+") || isNegativeGood
      ? "text-primary"
      : chart.delta.startsWith("-")
        ? "text-red-400"
        : "text-muted-foreground";

  return (
    <div className="rounded-lg border border-border/70 bg-background/30 px-3 py-3">
      <p className="text-xs text-muted-foreground">{chart.label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{chart.value}</p>
      <p className={`text-xs ${deltaTone}`}>{chart.delta}</p>
      <div className="mt-2 h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chart.points}
            margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#A78BFA"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DashboardAnalyticsCharts({
  charts,
}: {
  charts: AnalyticsChartCard[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {charts.map((chart) => (
        <MiniSparkline key={chart.id} chart={chart} />
      ))}
    </div>
  );
}
