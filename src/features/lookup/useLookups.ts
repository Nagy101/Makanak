// ═══════════════════════════════════════════════════════════════
//  Lookup Hooks
//
//  Infinite-loop fix:
//  Each hook calls its fetch action exactly ONCE on mount via an
//  empty-dependency useEffect. The action itself is idempotent
//  (bails out if data is already loaded or a request is in-flight),
//  so it is completely safe to call unconditionally.
//
//  The old pattern  `if (array.length === 0 && !loading) fetch()`
//  with `[loading]` in deps was the source of the infinite loop:
//  a failed request reset `loading` → hook re-ran → re-fetched.
//
//  Removed hooks:
//  • useDisputeReasons  — /dispute-reasons endpoint doesn't exist.
//                         Use useRoleDisputeReasons(role) instead.
//  • useDisputeStatuses — /dispute-statuses endpoint doesn't exist.
//                         Use DisputeStatus constants from dispute.types.ts.
// ═══════════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLookupStore } from './store/lookupStore';
import {
  getOwnerDisputeReasons,
  getTenantDisputeReasons,
  getAllDisputeReasons,
} from './lookup.service';

// ── Governorates ──────────────────────────────────────────────
export const useGovernorates = () => {
  const governorates = useLookupStore((s) => s.governorates);
  const fetching = useLookupStore((s) => s.fetching);
  const fetch = useLookupStore((s) => s.fetchGovernorates);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);
  return { governorates, loading: !!fetching['governorates'] };
};

// ── Amenities ─────────────────────────────────────────────────
export const useAmenities = () => {
  const amenities = useLookupStore((s) => s.amenities);
  const fetching = useLookupStore((s) => s.fetching);
  const fetch = useLookupStore((s) => s.fetchAmenities);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);
  return { amenities, loading: !!fetching['amenities'] };
};

// ── Property Types ────────────────────────────────────────────
export const usePropertyTypes = () => {
  const propertyTypes = useLookupStore((s) => s.propertyTypes);
  const fetching = useLookupStore((s) => s.fetching);
  const fetch = useLookupStore((s) => s.fetchPropertyTypes);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);
  return { propertyTypes, loading: !!fetching['propertyTypes'] };
};

// ── Property Statuses ─────────────────────────────────────────
export const usePropertyStatuses = () => {
  const propertyStatuses = useLookupStore((s) => s.propertyStatuses);
  const fetching = useLookupStore((s) => s.fetching);
  const fetch = useLookupStore((s) => s.fetchPropertyStatuses);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);
  return { propertyStatuses, loading: !!fetching['propertyStatuses'] };
};

// ── User Statuses ─────────────────────────────────────────────
export const useUserStatuses = () => {
  const userStatuses = useLookupStore((s) => s.userStatuses);
  const fetching = useLookupStore((s) => s.fetching);
  const fetch = useLookupStore((s) => s.fetchUserStatuses);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);
  return { userStatuses, loading: !!fetching['userStatuses'] };
};

// ── User Types ────────────────────────────────────────────────
export const useUserTypes = () => {
  const userTypes = useLookupStore((s) => s.userTypes);
  const fetching = useLookupStore((s) => s.fetching);
  const fetch = useLookupStore((s) => s.fetchUserTypes);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);
  return { userTypes, loading: !!fetching['userTypes'] };
};

// ── Booking Statuses ──────────────────────────────────────────
export const useBookingStatuses = () => {
  const bookingStatuses = useLookupStore((s) => s.bookingStatuses);
  const fetching = useLookupStore((s) => s.fetching);
  const fetch = useLookupStore((s) => s.fetchBookingStatuses);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);
  return { bookingStatuses, loading: !!fetching['bookingStatuses'] };
};

// ── Sorting Options ───────────────────────────────────────────
export const useSortingOptions = () => {
  const sortingOptions = useLookupStore((s) => s.sortingOptions);
  const fetching = useLookupStore((s) => s.fetching);
  const fetch = useLookupStore((s) => s.fetchSortingOptions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);
  return { sortingOptions, loading: !!fetching['sortingOptions'] };
};

// ── useAllLookups — called once in App.tsx on boot ────────────
/**
 * Triggers fetchAllLookups on mount (once). Safe to call anywhere.
 * Returns the full store snapshot for convenience.
 */
export const useAllLookups = () => {
  const fetch = useLookupStore((s) => s.fetchAllLookups);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);
  return useLookupStore();
};

// ── useLookups — read-only store access ───────────────────────
export const useLookups = () => useLookupStore();

// ── Role-based Dispute Reasons (TanStack Query) ───────────────
export type DisputeReasonRole = 'tenant' | 'owner' | 'admin';

/**
 * Fetches dispute reasons for the given role.
 * Uses the correct existing endpoints:
 *   tenant → /api/Lookup/tenant-dispute-reasons
 *   owner  → /api/Lookup/owner-dispute-reasons
 *   admin  → /api/Lookup/all-dispute-reasons
 *
 * `enabled` — set to false (e.g., pass modal `open` state) to defer
 * the request until the UI actually needs the data.
 */
export const useRoleDisputeReasons = (role: DisputeReasonRole, enabled = true) => {
  const fetchFn =
    role === 'owner'
      ? getOwnerDisputeReasons
      : role === 'admin'
        ? getAllDisputeReasons
        : getTenantDisputeReasons;

  const { data, isLoading, error } = useQuery({
    queryKey: ['lookups', 'dispute-reasons', role] as const,
    queryFn: fetchFn,
    enabled,
    staleTime: 10 * 60 * 1000, // 10 min — enums change rarely
    gcTime: 30 * 60 * 1000,    // keep in memory for 30 min
  });

  return { disputeReasons: data ?? [], isLoading, error };
};
