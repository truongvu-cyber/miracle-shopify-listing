export interface OptionConfig {
  name: string;
  values: string[];
}

export interface ListingFormData {
  title: string;
  vendor: string;
  skuPrefix: string;
  tags: string[];
  bodyHtml: string;
  published: boolean;
  status: string;

  variantPrice: string;
  compareAtPrice: string;

  options: OptionConfig[];
}

export interface VariantData {
  option1Value: string;
  option2Value: string;
  option3Value: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  imageSrc: string;
  variantImage: string;
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface ListingJob {
  id: string;
  title: string;
  status: JobStatus;
  progress: number;
  csvPath?: string;
  csvData?: Record<string, string>[];
  errorMessage?: string;
  createdAt: string;
  variantCount: number;
}

export const DEFAULT_FORM_DATA: ListingFormData = {
  title: "",
  vendor: "",
  skuPrefix: "",
  tags: [],
  bodyHtml: "",
  published: true,
  status: "active",
  variantPrice: "",
  compareAtPrice: "",
  options: [{ name: "", values: [] }],
};
