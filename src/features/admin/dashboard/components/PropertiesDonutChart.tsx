// ═══════════════════════════════════════════════════════════════
//  PropertiesDonutChart — Lazy-loaded Recharts module.
//  Shows property status distribution as a donut chart.
//
//  ⚠ This file imports Recharts directly.
//  It MUST be consumed via React.lazy() to keep Recharts out of
//  the initial JS bundle.
// ═══════════════════════════════════════════════════════════════
import { memo, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { PropertyStats, PropertyChartEntry } from "../dashboard.types";

// ── Colour palette (Royal Blue → amber → red → slate) ─────────
const PROPERTY_COLORS: Record<string, string> = {
  Active: "#1559AC",
  Pending: "#F59E0B",
  Rejected: "#EF4444",
};

interface PropertiesDonutChartProps {
  data: PropertyStats;
}

const PropertiesDonutChart = memo(function PropertiesDonutChart({
  data,
}: PropertiesDonutChartProps) {
  // ── Memoised transformation ────────────────────────────────
  const chartData = useMemo<PropertyChartEntry[]>(
    () =>
      [
        {
          name: "Active",
          value: data.activeProperties,
          fill: PROPERTY_COLORS.Active,
        },
        {
          name: "Pending",
          value: data.pendingApprovalProperties,
          fill: PROPERTY_COLORS.Pending,
        },
        {
          name: "Rejected",
          value: data.rejectedProperties,
          fill: PROPERTY_COLORS.Rejected,
        },
      ].filter((e) => e.value > 0),
    [data],
  );

  const total = data.totalProperties;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Property Distribution
        </CardTitle>
        <CardDescription>{total} total properties</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) =>
                percent > 0.04 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
              }
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              contentStyle={{ borderRadius: 8, fontSize: 13 }}
            />
            <Legend
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

PropertiesDonutChart.displayName = "PropertiesDonutChart";
export default PropertiesDonutChart;
