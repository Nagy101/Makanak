import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLookupStore } from './store/lookupStore';
import {
  getOwnerDisputeReasons,
  getTenantDisputeReasons,
  getAllDisputeReasons,
} from './lookup.service';

/**
 * Hook to fetch and cache governorates
 * Automatically fetches on first use if not already loaded
 */
export const useGovernorates = () => {
  const governorates = useLookupStore((s) => s.governorates);
  const loading = useLookupStore((s) => s.loading);
  const error = useLookupStore((s) => s.error);
  const fetchGovernorates = useLookupStore((s) => s.fetchGovernorates);

  useEffect(() => {
    if (governorates.length === 0 && !loading) {
      fetchGovernorates();
    }
  }, [governorates.length, loading, fetchGovernorates]);

  return { governorates, loading, error };
};

/**
 * Hook to fetch and cache amenities
 * Automatically fetches on first use if not already loaded
 */
export const useAmenities = () => {
  const amenities = useLookupStore((s) => s.amenities);
  const loading = useLookupStore((s) => s.loading);
  const error = useLookupStore((s) => s.error);
  const fetchAmenities = useLookupStore((s) => s.fetchAmenities);

  useEffect(() => {
    if (amenities.length === 0 && !loading) {
      fetchAmenities();
    }
  }, [amenities.length, loading, fetchAmenities]);

  return { amenities, loading, error };
};

/**
 * Hook to fetch and cache property types
 * Automatically fetches on first use if not already loaded
 */
export const usePropertyTypes = () => {
  const propertyTypes = useLookupStore((s) => s.propertyTypes);
  const loading = useLookupStore((s) => s.loading);
  const error = useLookupStore((s) => s.error);
  const fetchPropertyTypes = useLookupStore((s) => s.fetchPropertyTypes);

  useEffect(() => {
    if (propertyTypes.length === 0 && !loading) {
      fetchPropertyTypes();
    }
  }, [propertyTypes.length, loading, fetchPropertyTypes]);

  return { propertyTypes, loading, error };
};

/**
 * Hook to fetch and cache property statuses
 * Automatically fetches on first use if not already loaded
 */
export const usePropertyStatuses = () => {
  const propertyStatuses = useLookupStore((s) => s.propertyStatuses);
  const loading = useLookupStore((s) => s.loading);
  const error = useLookupStore((s) => s.error);
  const fetchPropertyStatuses = useLookupStore((s) => s.fetchPropertyStatuses);

  useEffect(() => {
    if (propertyStatuses.length === 0 && !loading) {
      fetchPropertyStatuses();
    }
  }, [propertyStatuses.length, loading, fetchPropertyStatuses]);

  return { propertyStatuses, loading, error };
};

/**
 * Hook to fetch and cache user statuses
 * Automatically fetches on first use if not already loaded
 */
export const useUserStatuses = () => {
  const userStatuses = useLookupStore((s) => s.userStatuses);
  const loading = useLookupStore((s) => s.loading);
  const error = useLookupStore((s) => s.error);
  const fetchUserStatuses = useLookupStore((s) => s.fetchUserStatuses);

  useEffect(() => {
    if (userStatuses.length === 0 && !loading) {
      fetchUserStatuses();
    }
  }, [userStatuses.length, loading, fetchUserStatuses]);

  return { userStatuses, loading, error };
};

/**
 * Hook to fetch and cache user types
 * Automatically fetches on first use if not already loaded
 */
export const useUserTypes = () => {
  const userTypes = useLookupStore((s) => s.userTypes);
  const loading = useLookupStore((s) => s.loading);
  const error = useLookupStore((s) => s.error);
  const fetchUserTypes = useLookupStore((s) => s.fetchUserTypes);

  useEffect(() => {
    if (userTypes.length === 0 && !loading) {
      fetchUserTypes();
    }
  }, [userTypes.length, loading, fetchUserTypes]);

  return { userTypes, loading, error };
};

/**
 * Hook to fetch and cache dispute reasons
 * Automatically fetches on first use if not already loaded
 */
export const useDisputeReasons = () => {
  const disputeReasons = useLookupStore((s) => s.disputeReasons);
  const loading = useLookupStore((s) => s.loading);
  const error = useLookupStore((s) => s.error);
  const fetchDisputeReasons = useLookupStore((s) => s.fetchDisputeReasons);

  useEffect(() => {
    if (disputeReasons.length === 0 && !loading) {
      fetchDisputeReasons();
    }
  }, [disputeReasons.length, loading, fetchDisputeReasons]);

  return { disputeReasons, loading, error };
};

/**
 * Hook to fetch and cache booking statuses
 * Automatically fetches on first use if not already loaded
 */
export const useBookingStatuses = () => {
  const bookingStatuses = useLookupStore((s) => s.bookingStatuses);
  const loading = useLookupStore((s) => s.loading);
  const error = useLookupStore((s) => s.error);
  const fetchBookingStatuses = useLookupStore((s) => s.fetchBookingStatuses);

  useEffect(() => {
    if (bookingStatuses.length === 0 && !loading) {
      fetchBookingStatuses();
    }
  }, [bookingStatuses.length, loading, fetchBookingStatuses]);

  return { bookingStatuses, loading, error };
};

/**
 * Hook to fetch and cache dispute statuses
 * Automatically fetches on first use if not already loaded
 */
export const useDisputeStatuses = () => {
  const disputeStatuses = useLookupStore((s) => s.disputeStatuses);
  const loading = useLookupStore((s) => s.loading);
  const error = useLookupStore((s) => s.error);
  const fetchDisputeStatuses = useLookupStore((s) => s.fetchDisputeStatuses);

  useEffect(() => {
    if (disputeStatuses.length === 0 && !loading) {
      fetchDisputeStatuses();
    }
  }, [disputeStatuses.length, loading, fetchDisputeStatuses]);

  return { disputeStatuses, loading, error };
};

/**
 * Hook to fetch and cache sorting options
 */
export const useSortingOptions = () => {
  const sortingOptions = useLookupStore((s) => s.sortingOptions);
  const loading = useLookupStore((s) => s.loading);
  const error = useLookupStore((s) => s.error);
  const fetchSortingOptions = useLookupStore((s) => s.fetchSortingOptions);

  useEffect(() => {
    if (sortingOptions.length === 0 && !loading) {
      fetchSortingOptions();
    }
  }, [sortingOptions.length, loading, fetchSortingOptions]);

  return { sortingOptions, loading, error };
};

/**
 * Hook to fetch all lookups at once
 * Useful for initializing the app
 */
export const useAllLookups = () => {
  const loading = useLookupStore((s) => s.loading);
  const fetchAllLookups = useLookupStore((s) => s.fetchAllLookups);
  const governorates = useLookupStore((s) => s.governorates);
  const amenities = useLookupStore((s) => s.amenities);
  const propertyTypes = useLookupStore((s) => s.propertyTypes);

  useEffect(() => {
    const hasAnyData = governorates.length > 0 || amenities.length > 0 || propertyTypes.length > 0;

    if (!hasAnyData && !loading) {
      fetchAllLookups();
    }
  }, [loading, fetchAllLookups, governorates.length, amenities.length, propertyTypes.length]);

  return useLookupStore();
};

/**
 * Hook to get cached lookups without fetching
 * Returns current state from store
 */
export const useLookups = () => {
  return useLookupStore();
};

// ── Role-based Dispute Reasons (fetched on-demand via React Query) ──────────

export type DisputeReasonRole = 'tenant' | 'owner' | 'admin';

/**
 * Fetches dispute reasons for the given role from the role-specific endpoint.
 * Cached per-role by React Query. Enabled only when `enabled` is true
 * (pass `open` or similar to avoid fetching before the modal is shown).
 */
export const useRoleDisputeReasons = (role: DisputeReasonRole, enabled = true) => {
  const fetchFn =
    role === 'owner'
      ? getOwnerDisputeReasons
      : role === 'admin'
        ? getAllDisputeReasons
        : getTenantDisputeReasons;

  const { data, isLoading, error } = useQuery({
    queryKey: ['lookups', 'dispute-reasons', role],
    queryFn: fetchFn,
    enabled,
    staleTime: 10 * 60 * 1000, // 10 min — these change rarely
  });

  return { disputeReasons: data ?? [], isLoading, error };
};
