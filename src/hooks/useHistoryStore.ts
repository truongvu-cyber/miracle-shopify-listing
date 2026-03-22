import { create } from "zustand";
import { useAuthStore } from "@/hooks/useAuthStore";

export interface HistoryEntry {
  id: string;
  name: string;
  sku: string;
  variantCount: number;
  createdAt: string;
  csvPath: string;
  fileSize?: number;
  username: string;
  csvData?: Record<string, string>[];
}

interface HistoryState {
  entries: HistoryEntry[];
  filterMonth: string;
  searchQuery: string;
  selectedIds: Set<string>;
  currentPage: number;
  pageSize: number;

  setFilterMonth: (month: string) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  loadHistory: (entries: HistoryEntry[]) => void;
  addEntry: (entry: HistoryEntry) => void;
  deleteEntry: (id: string) => void;
  deleteMultiple: (ids: string[]) => void;

  filteredEntries: () => HistoryEntry[];
  paginatedEntries: () => HistoryEntry[];
  totalPages: () => number;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],
  filterMonth: "",
  searchQuery: "",
  selectedIds: new Set(),
  currentPage: 1,
  pageSize: 10,

  setFilterMonth: (month) => set({ filterMonth: month, currentPage: 1 }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    }),

  selectAll: () => {
    const filtered = get().filteredEntries();
    const ids = new Set(filtered.map((e) => e.id));
    set({ selectedIds: ids });
  },

  clearSelection: () => set({ selectedIds: new Set() }),

  loadHistory: (entries) => set({ entries }),

  addEntry: (entry) =>
    set((state) => ({ entries: [entry, ...state.entries] })),

  deleteEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
      selectedIds: (() => {
        const next = new Set(state.selectedIds);
        next.delete(id);
        return next;
      })(),
    })),

  deleteMultiple: (ids) =>
    set((state) => {
      const idSet = new Set(ids);
      return {
        entries: state.entries.filter((e) => !idSet.has(e.id)),
        selectedIds: new Set(),
      };
    }),

  filteredEntries: () => {
    const { entries, filterMonth, searchQuery } = get();
    // Get current user from auth store
    const authStore = useAuthStore.getState();
    const currentUser = authStore.user;

    let filtered = entries;

    // Members see only their own listings, admin sees all
    if (currentUser && currentUser.role !== "admin") {
      filtered = filtered.filter((e) => e.username === currentUser.username);
    }

    if (filterMonth) {
      filtered = filtered.filter((e) => e.createdAt.startsWith(filterMonth));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.sku && e.sku.toLowerCase().includes(q))
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  paginatedEntries: () => {
    const { currentPage, pageSize } = get();
    const filtered = get().filteredEntries();
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  },

  totalPages: () => {
    const { pageSize } = get();
    const total = get().filteredEntries().length;
    return Math.max(1, Math.ceil(total / pageSize));
  },
}));
