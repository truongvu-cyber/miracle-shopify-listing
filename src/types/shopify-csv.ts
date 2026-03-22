import { SHOPIFY_CSV_HEADERS } from "@/lib/shopify-csv";

export type ShopifyCSVHeader = (typeof SHOPIFY_CSV_HEADERS)[number];

export type ShopifyCSVRow = Record<ShopifyCSVHeader, string>;
