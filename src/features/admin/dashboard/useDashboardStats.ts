// ═══════════════════════════════════════════════════════════════
//  Admin Dashboard — TanStack Query Hooks
//
//  ARCHITECTURE NOTE: These are 4 completely independent hooks.
//  When a component calls all 4, TanStack Query fires all 4
//  network requests in parallel — zero waterfall.
//
//  staleTime = 2 min  → safe for a near-real-time dashboard.
//  gcTime    = 5 min  → keeps data warm between tab switches.
// ═══════════════════════════════════════════════════════════════
import { useQuery } from '@tanstack/react-query';
import * as dashboardService from './dashboard.service';

const STALE = 2 * 60 * 1000;   // 2 minutes
const GC    = 5 * 60 * 1000;   // 5 minutes

// ── Query key factory ──────────────────────────────────────────
export const dashboardKeys = {
  all:        ['dashboard'] as const,
  users:      ['dashboard', 'users-stats'] as const,
  properties: ['dashboard', 'properties-stats'] as const,
  bookings:   ['dashboard', 'bookings-stats'] as const,
  financial:  ['dashboard', 'financial-stats'] as const,
};

// ── 1. Users Stats ─────────────────────────────────────────────
export function useUserStats() {
  return useQuery({
    queryKey: dashboardKeys.users,
    queryFn: dashboardService.getUserStats,
    staleTime: STALE,
    gcTime: GC,
  });
}

// ── 2. Properties Stats ────────────────────────────────────────
export function usePropertyStats() {
  return useQuery({
    queryKey: dashboardKeys.properties,
    queryFn: dashboardService.getPropertyStats,
    staleTime: STALE,
    gcTime: GC,
  });
}

// ── 3. Bookings Stats ──────────────────────────────────────────
export function useBookingsStats() {
  return useQuery({
    queryKey: dashboardKeys.bookings,
    queryFn: dashboardService.getBookingsStats,
    staleTime: STALE,
    gcTime: GC,
  });
}

// ── 4. Financial Stats ─────────────────────────────────────────
export function useFinancialStats() {
  return useQuery({
    queryKey: dashboardKeys.financial,
    queryFn: dashboardService.getFinancialStats,
    staleTime: STALE,
    gcTime: GC,
  });
}
