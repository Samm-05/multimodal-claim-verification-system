import { create } from 'zustand';
import type { Claim } from '../types';

interface ClaimsFilter {
  objectType: string;
  severity: string;
  dateRange: string;
}

interface ClaimsStoreState {
  searchQuery: string;
  filters: ClaimsFilter;
  activeClaim: Claim | null;
  isUploadModalOpen: boolean;
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof ClaimsFilter, value: string) => void;
  setActiveClaim: (claim: Claim | null) => void;
  setUploadModalOpen: (open: boolean) => void;
  resetFilters: () => void;
}

export const useClaimsStore = create<ClaimsStoreState>((set) => ({
  searchQuery: '',
  filters: {
    objectType: 'All',
    severity: 'All',
    dateRange: 'All',
  },
  activeClaim: null,
  isUploadModalOpen: false,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),

  setActiveClaim: (claim) => set({ activeClaim: claim }),

  setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),

  resetFilters: () =>
    set({
      searchQuery: '',
      filters: {
        objectType: 'All',
        severity: 'All',
        dateRange: 'All',
      },
    }),
}));
