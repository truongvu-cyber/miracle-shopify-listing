export const SHOPIFY_CSV_HEADERS = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Option3 Name",
  "Option3 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Gift Card",
  "Variant Image",
  "Variant Weight Unit",
  "Cost per item",
  "Status",
] as const;

export type ShopifyCSVHeaderType = (typeof SHOPIFY_CSV_HEADERS)[number];

export function createEmptyRow(): Record<ShopifyCSVHeaderType, string> {
  const row = {} as Record<ShopifyCSVHeaderType, string>;
  for (const header of SHOPIFY_CSV_HEADERS) {
    row[header] = "";
  }
  return row;
}

export const DEFAULT_VALUES: Partial<Record<ShopifyCSVHeaderType, string>> = {
  Published: "TRUE",
  "Variant Inventory Policy": "deny",
  "Variant Fulfillment Service": "manual",
  "Variant Requires Shipping": "TRUE",
  "Variant Taxable": "FALSE",
  "Gift Card": "FALSE",
  "Variant Weight Unit": "lb",
  Status: "active",
};

export function escapeCSVField(field: string): string {
  if (
    field.includes(",") ||
    field.includes('"') ||
    field.includes("\n") ||
    field.includes("\r")
  ) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function rowsToCSV(rows: Record<ShopifyCSVHeaderType, string>[]): string {
  const headerLine = SHOPIFY_CSV_HEADERS.map(escapeCSVField).join(",");
  const dataLines = rows.map((row) =>
    SHOPIFY_CSV_HEADERS.map((h) => escapeCSVField(row[h] || "")).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
}
