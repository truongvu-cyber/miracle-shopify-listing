import { create } from "zustand";
import type { ListingFormData, ListingJob, JobStatus } from "@/types/listing";
import { DEFAULT_FORM_DATA } from "@/types/listing";

interface ListingState {
  formData: ListingFormData;
  jobs: ListingJob[];
  formErrors: Record<string, string>;

  setFormData: (data: Partial<ListingFormData>) => void;
  setFormField: <K extends keyof ListingFormData>(
    key: K,
    value: ListingFormData[K]
  ) => void;
  loadFormData: (data: ListingFormData) => void;
  resetForm: () => void;
  setFormErrors: (errors: Record<string, string>) => void;
  clearFormErrors: () => void;

  addJob: (job: ListingJob) => void;
  updateJob: (id: string, updates: Partial<ListingJob>) => void;
  updateJobStatus: (id: string, status: JobStatus, extra?: Partial<ListingJob>) => void;
  removeJob: (id: string) => void;
  clearCompletedJobs: () => void;

  addOption: () => void;
  removeOption: (index: number) => void;
  setOptionName: (index: number, name: string) => void;
  setOptionValues: (index: number, values: string[]) => void;
  clearOptionValues: (index: number) => void;

  totalVariantCount: () => number;
  completedJobsToday: () => number;
}

export const useListingStore = create<ListingState>((set, get) => ({
  formData: { ...DEFAULT_FORM_DATA },
  jobs: [],
  formErrors: {},

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setFormField: (key, value) =>
    set((state) => ({
      formData: { ...state.formData, [key]: value },
    })),

  loadFormData: (data) =>
    set({
      formData: {
        ...DEFAULT_FORM_DATA,
        ...data,
        options:
          data.options && data.options.length > 0
            ? data.options.map((o) => ({ name: o.name, values: [...o.values] }))
            : [{ name: "", values: [] }],
      },
      formErrors: {},
    }),

  resetForm: () =>
    set({ formData: { ...DEFAULT_FORM_DATA, options: [{ name: "", values: [] }] }, formErrors: {} }),

  setFormErrors: (errors) => set({ formErrors: errors }),
  clearFormErrors: () => set({ formErrors: {} }),

  addJob: (job) =>
    set((state) => ({ jobs: [...state.jobs, job] })),

  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    })),

  updateJobStatus: (id, status, extra) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id ? { ...j, status, ...extra } : j
      ),
    })),

  removeJob: (id) =>
    set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) })),

  clearCompletedJobs: () =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.status !== "completed"),
    })),

  addOption: () =>
    set((state) => {
      if (state.formData.options.length >= 3) return state;
      return {
        formData: {
          ...state.formData,
          options: [...state.formData.options, { name: "", values: [] }],
        },
      };
    }),

  removeOption: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        options: state.formData.options.filter((_, i) => i !== index),
      },
    })),

  setOptionName: (index, name) =>
    set((state) => {
      const options = [...state.formData.options];
      options[index] = { ...options[index], name };
      return { formData: { ...state.formData, options } };
    }),

  setOptionValues: (index, values) =>
    set((state) => {
      const options = [...state.formData.options];
      options[index] = { ...options[index], values };
      return { formData: { ...state.formData, options } };
    }),

  clearOptionValues: (index) =>
    set((state) => {
      const options = [...state.formData.options];
      if (!options[index]) return state;
      options[index] = { ...options[index], values: [] };
      return { formData: { ...state.formData, options } };
    }),

  totalVariantCount: () => {
    const { options } = get().formData;
    const counts = options
      .map((o) => o.values.length)
      .filter((c) => c > 0);
    if (counts.length === 0) return 0;
    return counts.reduce((a, b) => a * b, 1);
  },

  completedJobsToday: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get().jobs.filter(
      (j) => j.status === "completed" && j.createdAt.slice(0, 10) === today
    ).length;
  },
}));
