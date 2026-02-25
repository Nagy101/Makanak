// ═══════════════════════════════════════════════════════════════
//  Lookup Store — Zustand + sessionStorage persistence
//
//  ROOT CAUSE FIXES:
//
//  Bug 1 — Infinite request loop (shared `loading` flag):
//    Previously, all fetch actions shared a single `loading: boolean`.
//    When any one fetch failed, `loading` reset to false. Every hook
//    depended on `loading` in its useEffect, so ALL hooks re-ran,
//    saw empty arrays + `!loading`, and triggered new fetches →
//    infinite cycle.
//    FIX: Per-resource `fetching: Record<string, boolean>` + an
//    idempotency guard at the TOP of every action (bails if already
//    in-flight OR data already loaded). Hooks no longer depend on
//    `loading` at all — they fire once on mount and the action
//    decides whether to proceed.
//
//  Bug 2 — Two 404 endpoints crashing Promise.all:
//    /api/Lookup/dispute-reasons   → does not exist
//    /api/Lookup/dispute-statuses  → does not exist
//    FIX: Removed both. Use useRoleDisputeReasons(role) for reasons;
//    use DisputeStatus constants (dispute.types.ts) for statuses.
//
//  Bug 3 — Promise.all abort-on-first-failure:
//    fetchAllLookups used Promise.all — one 404 killed ALL fetches.
//    FIX: Switched to Promise.allSettled so a single failure never
//    prevents the rest from loading.
// ═══════════════════════════════════════════════════════════════
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LookupState } from '../lookup.types';
import * as lookupService from '../lookup.service';

// ── Store interface ───────────────────────────────────────────
interface LookupStore extends LookupState {
  fetchGovernorates: () => Promise<void>;
  fetchAmenities: () => Promise<void>;
  fetchPropertyTypes: () => Promise<void>;
  fetchPropertyStatuses: () => Promise<void>;
  fetchUserStatuses: () => Promise<void>;
  fetchUserTypes: () => Promise<void>;
  fetchBookingStatuses: () => Promise<void>;
  fetchSortingOptions: () => Promise<void>;
  fetchAllLookups: () => Promise<void>;
  reset: () => void;
}

// ── Initial state ─────────────────────────────────────────────
const initialState: LookupState = {
  governorates: [],
  amenities: [],
  propertyTypes: [],
  propertyStatuses: [],
  userStatuses: [],
  userTypes: [],
  bookingStatuses: [],
  sortingOptions: [],
  fetching: {},
};

// ── Idempotency helpers ───────────────────────────────────────
type DataKey = keyof Omit<LookupState, 'fetching'>;

/** Returns true only when it's safe — and necessary — to start fetching. */
function shouldFetch(get: () => LookupStore, key: DataKey): boolean {
  const s = get();
  if (s.fetching[key]) return false;                        // already in-flight
  if ((s[key] as unknown[]).length > 0) return false;       // already loaded
  return true;
}

function setFetching(
  set: (fn: (s: LookupStore) => Partial<LookupStore>) => void,
  key: string,
  value: boolean,
) {
  set((s) => ({ fetching: { ...s.fetching, [key]: value } }));
}

// ── Store ─────────────────────────────────────────────────────
export const useLookupStore = create<LookupStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Governorates ─────────────────────────────────────
      fetchGovernorates: async () => {
        if (!shouldFetch(get, 'governorates')) return;
        setFetching(set, 'governorates', true);
        try {
          const data = await lookupService.getGovernorates();
          set((s) => ({ governorates: data, fetching: { ...s.fetching, governorates: false } }));
        } catch {
          setFetching(set, 'governorates', false);
        }
      },

      // ── Amenities ────────────────────────────────────────
      fetchAmenities: async () => {
        if (!shouldFetch(get, 'amenities')) return;
        setFetching(set, 'amenities', true);
        try {
          const data = await lookupService.getAmenities();
          set((s) => ({ amenities: data, fetching: { ...s.fetching, amenities: false } }));
        } catch {
          setFetching(set, 'amenities', false);
        }
      },

      // ── Property Types ───────────────────────────────────
      fetchPropertyTypes: async () => {
        if (!shouldFetch(get, 'propertyTypes')) return;
        setFetching(set, 'propertyTypes', true);
        try {
          const data = await lookupService.getPropertyTypes();
          set((s) => ({ propertyTypes: data, fetching: { ...s.fetching, propertyTypes: false } }));
        } catch {
          setFetching(set, 'propertyTypes', false);
        }
      },

      // ── Property Statuses ────────────────────────────────
      fetchPropertyStatuses: async () => {
        if (!shouldFetch(get, 'propertyStatuses')) return;
        setFetching(set, 'propertyStatuses', true);
        try {
          const data = await lookupService.getPropertyStatuses();
          set((s) => ({ propertyStatuses: data, fetching: { ...s.fetching, propertyStatuses: false } }));
        } catch {
          setFetching(set, 'propertyStatuses', false);
        }
      },

      // ── User Statuses ────────────────────────────────────
      fetchUserStatuses: async () => {
        if (!shouldFetch(get, 'userStatuses')) return;
        setFetching(set, 'userStatuses', true);
        try {
          const data = await lookupService.getUserStatuses();
          set((s) => ({ userStatuses: data, fetching: { ...s.fetching, userStatuses: false } }));
        } catch {
          setFetching(set, 'userStatuses', false);
        }
      },

      // ── User Types ───────────────────────────────────────
      fetchUserTypes: async () => {
        if (!shouldFetch(get, 'userTypes')) return;
        setFetching(set, 'userTypes', true);
        try {
          const data = await lookupService.getUserTypes();
          set((s) => ({ userTypes: data, fetching: { ...s.fetching, userTypes: false } }));
        } catch {
          setFetching(set, 'userTypes', false);
        }
      },

      // ── Booking Statuses ─────────────────────────────────
      fetchBookingStatuses: async () => {
        if (!shouldFetch(get, 'bookingStatuses')) return;
        setFetching(set, 'bookingStatuses', true);
        try {
          const data = await lookupService.getBookingStatuses();
          set((s) => ({ bookingStatuses: data, fetching: { ...s.fetching, bookingStatuses: false } }));
        } catch {
          setFetching(set, 'bookingStatuses', false);
        }
      },

      // ── Sorting Options ──────────────────────────────────
      fetchSortingOptions: async () => {
        if (!shouldFetch(get, 'sortingOptions')) return;
        setFetching(set, 'sortingOptions', true);
        try {
          const data = await lookupService.getSortingOptions();
          set((s) => ({ sortingOptions: data, fetching: { ...s.fetching, sortingOptions: false } }));
        } catch {
          setFetching(set, 'sortingOptions', false);
        }
      },

      // ── fetchAllLookups — called once on app boot ────────
      // Uses Promise.allSettled so a single failure (e.g. network)
      // can never prevent all other lookups from loading.
      // Each action is self-guarding — safe to call even if some
      // data was already restored from sessionStorage cache.
      fetchAllLookups: async () => {
        const a = get();
        await Promise.allSettled([
          a.fetchGovernorates(),
          a.fetchAmenities(),
          a.fetchPropertyTypes(),
          a.fetchPropertyStatuses(),
          a.fetchUserStatuses(),
          a.fetchUserTypes(),
          a.fetchBookingStatuses(),
          a.fetchSortingOptions(),
        ]);
      },

      reset: () => set(initialState),
    }),
    {
      name: 'mk-lookups',
      version: 1, // bumped: clears old cache that contained removed keys
                  // (disputeReasons, disputeStatuses, loading, error)
      storage: createJSONStorage(() => sessionStorage),
      // Only persist data arrays — never persist in-flight `fetching` flags
      partialize: (state) => ({
        governorates: state.governorates,
        amenities: state.amenities,
        propertyTypes: state.propertyTypes,
        propertyStatuses: state.propertyStatuses,
        userStatuses: state.userStatuses,
        userTypes: state.userTypes,
        bookingStatuses: state.bookingStatuses,
        sortingOptions: state.sortingOptions,
        // fetching intentionally excluded — always starts as {}
      }),
    },
  ),
);
