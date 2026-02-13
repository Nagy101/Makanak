import { create } from 'zustand';
import type { LookupState } from '../lookup.types';
import * as lookupService from '../lookup.service';

interface LookupStore extends LookupState {
  fetchGovernorates: () => Promise<void>;
  fetchAmenities: () => Promise<void>;
  fetchPropertyTypes: () => Promise<void>;
  fetchPropertyStatuses: () => Promise<void>;
  fetchUserStatuses: () => Promise<void>;
  fetchUserTypes: () => Promise<void>;
  fetchDisputeReasons: () => Promise<void>;
  fetchBookingStatuses: () => Promise<void>;
  fetchDisputeStatuses: () => Promise<void>;
  fetchSortingOptions: () => Promise<void>;
  fetchAllLookups: () => Promise<void>;
  reset: () => void;
}

const initialState: LookupState = {
  governorates: [],
  amenities: [],
  propertyTypes: [],
  propertyStatuses: [],
  userStatuses: [],
  userTypes: [],
  disputeReasons: [],
  bookingStatuses: [],
  disputeStatuses: [],
  sortingOptions: [],
  loading: false,
  error: null,
};

export const useLookupStore = create<LookupStore>((set) => ({
  ...initialState,

  fetchGovernorates: async () => {
    set({ loading: true, error: null });
    try {
      const data = await lookupService.getGovernorates();
      set({ governorates: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchAmenities: async () => {
    set({ loading: true, error: null });
    try {
      const data = await lookupService.getAmenities();
      set({ amenities: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchPropertyTypes: async () => {
    set({ loading: true, error: null });
    try {
      const data = await lookupService.getPropertyTypes();
      set({ propertyTypes: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchPropertyStatuses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await lookupService.getPropertyStatuses();
      set({ propertyStatuses: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchUserStatuses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await lookupService.getUserStatuses();
      set({ userStatuses: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchUserTypes: async () => {
    set({ loading: true, error: null });
    try {
      const data = await lookupService.getUserTypes();
      set({ userTypes: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchDisputeReasons: async () => {
    set({ loading: true, error: null });
    try {
      const data = await lookupService.getDisputeReasons();
      set({ disputeReasons: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchBookingStatuses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await lookupService.getBookingStatuses();
      set({ bookingStatuses: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchDisputeStatuses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await lookupService.getDisputeStatuses();
      set({ disputeStatuses: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchSortingOptions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await lookupService.getSortingOptions();
      set({ sortingOptions: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchAllLookups: async () => {
    set({ loading: true, error: null });
    try {
      const [
        governorates,
        amenities,
        propertyTypes,
        propertyStatuses,
        userStatuses,
        userTypes,
        disputeReasons,
        bookingStatuses,
        disputeStatuses,
        sortingOptions,
      ] = await Promise.all([
        lookupService.getGovernorates(),
        lookupService.getAmenities(),
        lookupService.getPropertyTypes(),
        lookupService.getPropertyStatuses(),
        lookupService.getUserStatuses(),
        lookupService.getUserTypes(),
        lookupService.getDisputeReasons(),
        lookupService.getBookingStatuses(),
        lookupService.getDisputeStatuses(),
        lookupService.getSortingOptions(),
      ]);

      set({
        governorates,
        amenities,
        propertyTypes,
        propertyStatuses,
        userStatuses,
        userTypes,
        disputeReasons,
        bookingStatuses,
        disputeStatuses,
        sortingOptions,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  reset: () => set(initialState),
}));
