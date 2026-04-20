import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { ListingFormData } from "@/types/listing";

export interface HistoryEntry {
  id: string;
  name: string;
  sku: string;
  variantCount: number;
  createdAt: string;
  csvPath: string;
  fileSize?: number;
  csvData?: Record<string, string>[];
  /** Full form snapshot so the entry can be reopened for editing. */
  formData?: ListingFormData;
}

interface HistoryState {
  entries: HistoryEntry[];
  loaded: boolean;
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

  loadFromDisk: () => Promise<void>;
  persist: () => Promise<void>;
  addEntry: (entry: HistoryEntry) => void;
  updateEntry: (id: string, patch: Partial<HistoryEntry>) => void;
  deleteEntry: (id: string) => void;
  deleteMultiple: (ids: string[]) => void;

  filteredEntries: () => HistoryEntry[];
  paginatedEntries: () => HistoryEntry[];
  totalPages: () => number;
}

async function persistEntries(entries: HistoryEntry[]): Promise<void> {
  try {
    await invoke("save_history_raw", { data: JSON.stringify(entries) });
  } catch (err) {
    console.warn("Failed to persist history:", err);
  }
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],
  loaded: false,
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),

  selectAll: () => {
    const filtered = get().filteredEntries();
    set({ selectedIds: new Set(filtered.map((e) => e.id)) });
  },

  clearSelection: () => set({ selectedIds: new Set() }),

  loadFromDisk: async () => {
    try {
      const raw = await invoke<string>("load_history_raw");
      const parsed = JSON.parse(raw || "[]") as HistoryEntry[];
      set({ entries: Array.isArray(parsed) ? parsed : [], loaded: true });
    } catch (err) {
      console.warn("Failed to load history:", err);
      set({ loaded: true });
    }
  },

  persist: async () => {
    await persistEntries(get().entries);
  },

  addEntry: (entry) => {
    set((state) => {
      const next = [entry, ...state.entries];
      void persistEntries(next);
      return { entries: next };
    });
  },

  updateEntry: (id, patch) => {
    set((state) => {
      const next = state.entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
      void persistEntries(next);
      return { entries: next };
    });
  },

  deleteEntry: (id) => {
    set((state) => {
      const next = state.entries.filter((e) => e.id !== id);
      const nextSel = new Set(state.selectedIds);
      nextSel.delete(id);
      void persistEntries(next);
      return { entries: next, selectedIds: nextSel };
    });
  },

  deleteMultiple: (ids) => {
    set((state) => {
      const idSet = new Set(ids);
      const next = state.entries.filter((e) => !idSet.has(e.id));
      void persistEntries(next);
      return { entries: next, selectedIds: new Set() };
    });
  },

  filteredEntries: () => {
    const { entries, filterMonth, searchQuery } = get();
    let filtered = entries;

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
