// Types
export type {
  ApiResponse,
  Governorate,
  Amenity,
  PropertyType,
  PropertyStatus,
  UserStatus,
  UserType,
  DisputeReason,
  BookingStatus,
  SortingOption,
  LookupState,
} from './lookup.types';
// NOTE: DisputeStatus removed — use DisputeStatus constants from dispute.types.ts directly.

// Service
export * as lookupService from './lookup.service';

// Store
export { useLookupStore } from './store/lookupStore';

// Hooks
export {
  useGovernorates,
  useAmenities,
  usePropertyTypes,
  usePropertyStatuses,
  useUserStatuses,
  useUserTypes,
  useBookingStatuses,
  useSortingOptions,
  useAllLookups,
  useLookups,
  useRoleDisputeReasons,
  type DisputeReasonRole,
} from './useLookups';
// NOTE: useDisputeReasons & useDisputeStatuses removed — endpoints don't exist.
// Use useRoleDisputeReasons(role) for reasons; DisputeStatus constants for statuses.
