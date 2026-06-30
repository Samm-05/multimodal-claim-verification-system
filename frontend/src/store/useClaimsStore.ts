import { create } from 'zustand';
import type { Claim, MetricData, TaskItem, ClaimObject, Severity } from '../types';
import { claimsData, dashboardMetrics, urgentTasks } from '../constants/mockData';

interface ClaimsFilter {
  objectType: string;
  severity: string;
  dateRange: string;
}

interface ClaimsState {
  claims: Claim[];
  filteredClaims: Claim[];
  activeClaim: Claim | null;
  metrics: MetricData[];
  tasks: TaskItem[];
  searchQuery: string;
  filters: ClaimsFilter;
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof ClaimsFilter, value: string) => void;
  setActiveClaim: (claim: Claim | null) => void;
  approveClaim: (id: string) => void;
  rejectClaim: (id: string) => void;
  escalateClaim: (id: string) => void;
  addNewClaim: (claim: Omit<Claim, 'id' | 'date'>) => void;
  applyFilters: () => void;
}

export const useClaimsStore = create<ClaimsState>((set, get) => ({
  claims: claimsData,
  filteredClaims: claimsData,
  activeClaim: claimsData[0] || null,
  metrics: dashboardMetrics,
  tasks: urgentTasks,
  searchQuery: '',
  filters: {
    objectType: 'All Types',
    severity: 'All',
    dateRange: 'Last 7 Days',
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
    get().applyFilters();
  },

  setActiveClaim: (claim) => {
    set({ activeClaim: claim });
  },

  approveClaim: (id) => {
    set((state) => {
      const updatedClaims = state.claims.map((c) =>
        c.id === id ? { ...c, aiDecision: 'approve' as const, status: 'completed' as const } : c
      );
      const activeClaim = state.activeClaim?.id === id
        ? { ...state.activeClaim, aiDecision: 'approve' as const, status: 'completed' as const }
        : state.activeClaim;
      
      // Also update reviewed metric
      const reviewedCount = updatedClaims.filter(c => c.status === 'completed' || c.status === 'finalizing').length;
      const updatedMetrics = state.metrics.map(m => 
        m.label === 'Reviewed' ? { ...m, value: reviewedCount.toString() } : m
      );

      return {
        claims: updatedClaims,
        activeClaim,
        metrics: updatedMetrics,
      };
    });
    get().applyFilters();
  },

  rejectClaim: (id) => {
    set((state) => {
      const updatedClaims = state.claims.map((c) =>
        c.id === id ? { ...c, aiDecision: 'reject' as const, status: 'flagged' as const } : c
      );
      const activeClaim = state.activeClaim?.id === id
        ? { ...state.activeClaim, aiDecision: 'reject' as const, status: 'flagged' as const }
        : state.activeClaim;

      return {
        claims: updatedClaims,
        activeClaim,
      };
    });
    get().applyFilters();
  },

  escalateClaim: (id) => {
    set((state) => {
      const updatedClaims = state.claims.map((c) =>
        c.id === id ? { ...c, aiDecision: 'escalate' as const, status: 'escalated' as const } : c
      );
      const activeClaim = state.activeClaim?.id === id
        ? { ...state.activeClaim, aiDecision: 'escalate' as const, status: 'escalated' as const }
        : state.activeClaim;

      return {
        claims: updatedClaims,
        activeClaim,
      };
    });
    get().applyFilters();
  },

  addNewClaim: (newClaimData) => {
    const id = `#CLM-${Math.floor(10000 + Math.random() * 90000)}`;
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fullClaim: Claim = {
      ...newClaimData,
      id,
      date,
    };

    set((state) => {
      const updatedClaims = [fullClaim, ...state.claims];
      const totalCount = updatedClaims.length;
      const updatedMetrics = state.metrics.map(m => 
        m.label === 'Total Claims' ? { ...m, value: totalCount.toString() } : m
      );
      return {
        claims: updatedClaims,
        metrics: updatedMetrics,
      };
    });
    get().applyFilters();
  },

  applyFilters: () => {
    const { claims, searchQuery, filters } = get();
    let result = [...claims];

    // Apply Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.customer.name.toLowerCase().includes(q) ||
          c.object.name.toLowerCase().includes(q)
      );
    }

    // Apply Object Type Filter
    if (filters.objectType !== 'All Types') {
      const type = filters.objectType.toLowerCase() as ClaimObject;
      result = result.filter((c) => c.object.type === type);
    }

    // Apply Severity Filter
    if (filters.severity !== 'All') {
      const sev = filters.severity.toLowerCase() as Severity;
      result = result.filter((c) => c.severity === sev);
    }

    set({ filteredClaims: result });
  },
}));
