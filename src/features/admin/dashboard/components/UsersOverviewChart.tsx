// ═══════════════════════════════════════════════════════════════
//  UsersOverviewChart — Lazy-loaded Recharts module.
//  Two side-by-side pie/donut charts:
//    Left  → User Roles   (Admin / Owner / Tenant)
//    Right → User Statuses (Active / Pending / Rejected / Banned / New)
//
//  ⚠ Must be consumed via React.lazy().
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
import type {
  UserStats,
  UserRoleEntry,
  UserStatusEntry,
} from "../dashboard.types";

// ── Palettes ───────────────────────────────────────────────────
const ROLE_COLORS = ["#1559AC", "#2563EB", "#60A5FA"];
const STATUS_COLORS = ["#16A34A", "#F59E0B", "#EF4444", "#6B7280", "#94A3B8"];

interface UsersOverviewChartProps {
  data: UserStats;
}

const UsersOverviewChart = memo(function UsersOverviewChart({
  data,
}: UsersOverviewChartProps) {
  // ── Roles data ─────────────────────────────────────────────
  const rolesData = useMemo<UserRoleEntry[]>(
    () =>
      [
        { name: "Admins", value: data.adminsCount, fill: ROLE_COLORS[0] },
        { name: "Owners", value: data.ownersCount, fill: ROLE_COLORS[1] },
        { name: "Tenants", value: data.tenantsCount, fill: ROLE_COLORS[2] },
      ].filter((e) => e.value >= 0),
    [data],
  );

  // ── Statuses data ──────────────────────────────────────────
  const statusData = useMemo<UserStatusEntry[]>(
    () =>
      [
        { name: "Active", value: data.activeUsers, fill: STATUS_COLORS[0] },
        { name: "Pending", value: data.pendingUsers, fill: STATUS_COLORS[1] },
        { name: "Rejected", value: data.rejectsCount, fill: STATUS_COLORS[2] },
        { name: "Banned", value: data.bannedsCount, fill: STATUS_COLORS[3] },
        { name: "New", value: data.newsCount, fill: STATUS_COLORS[4] },
      ].filter((e) => e.value >= 0),
    [data],
  );

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          User Demographics
        </CardTitle>
        <CardDescription>{data.totalUsers} registered users</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Two responsive pie charts side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ── Roles ─────────────────────────────────── */}
          <div>
            <p className="text-xs font-medium text-center text-muted-foreground mb-1 uppercase tracking-wide">
              By Role
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={rolesData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                >
                  {rolesData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 13,
                    background: "var(--color-card, #ffffff)",
                    border: "1px solid var(--color-border, #e2e8f0)",
                    color: "var(--color-foreground, #111827)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={9}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ── Statuses ───────────────────────────────────────── */}
          <div>
            <p className="text-xs font-medium text-center text-muted-foreground mb-1 uppercase tracking-wide">
              By Status
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 13,
                    background: "var(--color-card, #ffffff)",
                    border: "1px solid var(--color-border, #e2e8f0)",
                    color: "var(--color-foreground, #111827)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={9}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

UsersOverviewChart.displayName = "UsersOverviewChart";
export default UsersOverviewChart;
