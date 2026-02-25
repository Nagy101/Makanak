// ═══════════════════════════════════════════════════════════════
//  AdminDashboardPage — Analytics Home
//
//  Architecture:
//  ┌─────────────────────────────────────────────────────────────┐
//  │  4 queries fire in parallel (zero waterfall)                │
//  │  Each section renders independently from its own isLoading  │
//  │  Chart bundles are lazy-loaded (Recharts stays out of the   │
//  │  initial JS payload)                                        │
//  └─────────────────────────────────────────────────────────────┘
//
//  Layout:
//  ┌──────────────────────────────────────────────────────────┐
//  │  TOP ROW      3 financial metric cards (high-impact)     │
//  ├──────────────────────────────────────────────────────────┤
//  │  MIDDLE ROW   Properties Donut  │  Bookings Bar          │
//  ├──────────────────────────────────────────────────────────┤
//  │  BOTTOM ROW   User Demographics (Role + Status Pies)     │
//  └──────────────────────────────────────────────────────────┘
// ═══════════════════════════════════════════════════════════════
import { lazy, Suspense, memo } from 'react';
import { TrendingUp, Wallet, Landmark, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

import {
  useFinancialStats,
  usePropertyStats,
  useBookingsStats,
  useUserStats,
  dashboardKeys,
} from '../dashboard/useDashboardStats';
import { FinancialCard } from '../dashboard/components/FinancialCard';
import { StatCardSkeleton } from '../dashboard/components/StatCardSkeleton';
import { ChartSkeleton } from '../dashboard/components/ChartSkeleton';

// ── Lazy-load all chart modules (Recharts stays out of initial bundle) ──
const PropertiesDonutChart = lazy(
  () => import(
    /* webpackChunkName: "chart-properties" */
    '../dashboard/components/PropertiesDonutChart'
  ),
);
const BookingsBarChart = lazy(
  () => import(
    /* webpackChunkName: "chart-bookings" */
    '../dashboard/components/BookingsBarChart'
  ),
);
const UsersOverviewChart = lazy(
  () => import(
    /* webpackChunkName: "chart-users" */
    '../dashboard/components/UsersOverviewChart'
  ),
);

// ── Section wrapper keeps layout stable while content loads ───
const SectionTitle = memo(function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
      {children}
    </h2>
  );
});
SectionTitle.displayName = 'SectionTitle';

// ══════════════════════════════════════════════════════════════
//  Main Page
// ══════════════════════════════════════════════════════════════
const AdminDashboardPage = memo(function AdminDashboardPage() {
  const qc = useQueryClient();

  // ── 4 parallel queries — NO chaining ─────────────────────
  const financial  = useFinancialStats();
  const properties = usePropertyStats();
  const bookings   = useBookingsStats();
  const users      = useUserStats();

  // ── Manual refresh ────────────────────────────────────────
  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: dashboardKeys.all });
  };

  const isAnyRefetching =
    financial.isFetching ||
    properties.isFetching ||
    bookings.isFetching ||
    users.isFetching;

  return (
    <div className="space-y-8">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time overview of the Makanak platform
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isAnyRefetching}
          className="self-start sm:self-auto gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isAnyRefetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* ══════════════════════════════════════════════════════
          TOP ROW — Financial Metrics
          Renders as soon as `useFinancialStats` resolves,
          completely independent of the other 3 queries.
      ════════════════════════════════════════════════════════ */}
      <section className="space-y-3">
        <SectionTitle>Financial Overview</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {financial.isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : financial.data ? (
            <>
              <FinancialCard
                label="Total Booking Volume"
                amount={financial.data.totalBookingVolume}
                icon={TrendingUp}
                accentClass="bg-[#1E3A8A]/10 text-[#1E3A8A]"
                description="Gross revenue across all bookings"
              />
              <FinancialCard
                label="Platform Earnings"
                amount={financial.data.totalPlatformEarnings}
                icon={Wallet}
                accentClass="bg-emerald-50 text-emerald-600"
                description="Makanak's net commission"
              />
              <FinancialCard
                label="Cash Owed to Owners"
                amount={financial.data.totalCashExpectedByOwners}
                icon={Landmark}
                accentClass="bg-amber-50 text-amber-600"
                description="Pending owner payouts"
              />
            </>
          ) : null}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MIDDLE ROW — Properties + Bookings Charts (side-by-side)
          Each renders independently from its own query.
      ════════════════════════════════════════════════════════ */}
      <section className="space-y-3">
        <SectionTitle>Properties &amp; Bookings</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Properties Donut */}
          {properties.isLoading ? (
            <ChartSkeleton />
          ) : properties.data ? (
            <Suspense fallback={<ChartSkeleton />}>
              <PropertiesDonutChart data={properties.data} />
            </Suspense>
          ) : null}

          {/* Bookings Bar */}
          {bookings.isLoading ? (
            <ChartSkeleton />
          ) : bookings.data ? (
            <Suspense fallback={<ChartSkeleton />}>
              <BookingsBarChart data={bookings.data} />
            </Suspense>
          ) : null}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BOTTOM ROW — User Demographics (full width)
          Renders independently from its own query.
      ════════════════════════════════════════════════════════ */}
      <section className="space-y-3">
        <SectionTitle>User Demographics</SectionTitle>
        {users.isLoading ? (
          <ChartSkeleton height={280} />
        ) : users.data ? (
          <Suspense fallback={<ChartSkeleton height={280} />}>
            <UsersOverviewChart data={users.data} />
          </Suspense>
        ) : null}
      </section>
    </div>
  );
});

AdminDashboardPage.displayName = 'AdminDashboardPage';
export default AdminDashboardPage;
