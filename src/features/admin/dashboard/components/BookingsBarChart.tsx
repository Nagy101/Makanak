// ═══════════════════════════════════════════════════════════════
//  BookingsBarChart — Lazy-loaded Recharts module.
//  Visualises booking status distribution as a horizontal bar chart.
//
//  ⚠ Must be consumed via React.lazy().
// ═══════════════════════════════════════════════════════════════
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { BookingsStats, BookingChartEntry } from "../dashboard.types";

// ── Colours ────────────────────────────────────────────────────
const BOOKING_COLORS: Record<string, string> = {
  Completed: "#1559AC",
  "Checked In": "#2563EB",
  "Payment Recv.": "#3B82F6",
  Pending: "#F59E0B",
  Cancelled: "#EF4444",
};

interface BookingsBarChartProps {
  data: BookingsStats;
}

const BookingsBarChart = memo(function BookingsBarChart({
  data,
}: BookingsBarChartProps) {
  const { t } = useTranslation();
  // ── Memoised transformation ────────────────────────────────
  const chartData = useMemo<BookingChartEntry[]>(
    () => [
      {
        name: t("admin.completedLabel"),
        value: data.completedBookings,
        fill: "#1559AC",
      },
      {
        name: t("admin.checkedInLabel"),
        value: data.checkedIn,
        fill: "#2563EB",
      },
      {
        name: t("admin.paymentRecvLabel"),
        value: data.paymentReceived,
        fill: "#3B82F6",
      },
      {
        name: t("admin.pendingLabel"),
        value: data.pendingBookings,
        fill: "#F59E0B",
      },
      {
        name: t("admin.cancelledLabel"),
        value: data.cancelledBookings,
        fill: "#EF4444",
      },
    ],
    [data, t],
  );

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          {t("admin.bookingStatusBreakdown")}
        </CardTitle>
        <CardDescription>
          {t("admin.totalBookingsCount", { count: data.totalBookings })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
            barSize={18}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="rgba(255,255,255,0.06)"
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={94}
            />
            <Tooltip
              cursor={{ fill: "rgba(59,130,246,0.06)" }}
              contentStyle={{
                borderRadius: 8,
                fontSize: 13,
                background: "var(--color-card, #ffffff)",
                border: "1px solid var(--color-border, #e2e8f0)",
                color: "var(--color-foreground, #111827)",
              }}
              formatter={(value: number) => [value, t("admin.bookingsLabel")]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

BookingsBarChart.displayName = "BookingsBarChart";
export default BookingsBarChart;
