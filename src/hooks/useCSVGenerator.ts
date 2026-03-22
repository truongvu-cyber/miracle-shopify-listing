import { useState, useCallback } from "react";
import type { ListingFormData } from "@/types/listing";
import type { MatchResult } from "@/types/drive";
import { createEmptyRow } from "@/lib/shopify-csv";
import type { ShopifyCSVHeaderType } from "@/lib/shopify-csv";
import { generateSlug } from "@/lib/slug";

interface UseCSVGeneratorReturn {
  generating: boolean;
  error: string | null;
  generateCSV: (
    formData: ListingFormData,
    matchResults: MatchResult[]
  ) => Promise<Record<ShopifyCSVHeaderType, string>[] | null>;
  buildRows: (
    formData: ListingFormData,
    matchResults: MatchResult[]
  ) => Record<ShopifyCSVHeaderType, string>[];
}

export function useCSVGenerator(): UseCSVGeneratorReturn {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildRows = useCallback(
    (
      formData: ListingFormData,
      matchResults: MatchResult[]
    ): Record<ShopifyCSVHeaderType, string>[] => {
      const handle = generateSlug(formData.title);
      const rows: Record<ShopifyCSVHeaderType, string>[] = [];

      const options = formData.options.filter(
        (o) => o.name && o.values.length > 0
      );

      const valueCombinations: string[][] = [];
      if (options.length === 0) {
        valueCombinations.push([]);
      } else if (options.length === 1) {
        for (const v1 of options[0].values) {
          valueCombinations.push([v1]);
        }
      } else if (options.length === 2) {
        for (const v1 of options[0].values) {
          for (const v2 of options[1].values) {
            valueCombinations.push([v1, v2]);
          }
        }
      } else if (options.length === 3) {
        for (const v1 of options[0].values) {
          for (const v2 of options[1].values) {
            for (const v3 of options[2].values) {
              valueCombinations.push([v1, v2, v3]);
            }
          }
        }
      }

      let imagePosition = 1;

      for (let i = 0; i < valueCombinations.length; i++) {
        const combo = valueCombinations[i];
        const row = createEmptyRow();

        row["Handle"] = handle;
        row["Variant Grams"] = "0.0";
        row["Variant Inventory Policy"] = "deny";
        row["Variant Fulfillment Service"] = "manual";
        row["Variant Price"] = formData.variantPrice || "0.00";
        row["Variant Compare At Price"] = formData.compareAtPrice || "";
        row["Variant Requires Shipping"] = "TRUE";
        row["Variant Taxable"] = "FALSE";
        row["Variant Weight Unit"] = "lb";
        row["Cost per item"] = formData.variantPrice || "";

        // Product-level fields: only on FIRST row
        if (i === 0) {
          row["Title"] = formData.title;
          row["Body (HTML)"] = formData.bodyHtml;
          row["Vendor"] = formData.vendor;
          row["Tags"] = formData.tags.join(", ");
          row["Published"] = "TRUE";
          row["Gift Card"] = "FALSE";
          row["Status"] = "active";
          // Option Names only on first row
          if (options[0]) row["Option1 Name"] = options[0].name;
          if (options[1]) row["Option2 Name"] = options[1].name;
          if (options[2]) row["Option3 Name"] = options[2].name;
        }

        // Option Values on ALL variant rows
        if (options[0]) row["Option1 Value"] = combo[0] || "";
        if (options[1]) row["Option2 Value"] = combo[1] || "";
        if (options[2]) row["Option3 Value"] = combo[2] || "";

        // SKU — dùng đúng giá trị user nhập
        row["Variant SKU"] = formData.skuPrefix || "";

        // Image matching
        const match = matchResults.find(
          (m) =>
            m.option1Value === (combo[0] || "") &&
            m.option2Value === (combo[1] || "")
        );

        if (match?.driveFile) {
          // Local files start with "local_", use Drive URL format for Drive files
          const isLocal = match.driveFile.id.startsWith("local_");
          const imgUrl = isLocal
            ? match.driveFile.webContentLink || ""
            : `https://drive.google.com/uc?export=view&id=${match.driveFile.id}`;
          row["Image Src"] = imgUrl;
          row["Image Position"] = String(imagePosition++);
          row["Variant Image"] = imgUrl;
        }

        rows.push(row);
      }

      return rows;
    },
    []
  );

  const generateCSV = useCallback(
    async (
      formData: ListingFormData,
      matchResults: MatchResult[]
    ): Promise<Record<ShopifyCSVHeaderType, string>[] | null> => {
      setGenerating(true);
      setError(null);

      try {
        const rows = buildRows(formData, matchResults);
        return rows;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [buildRows]
  );

  return { generating, error, generateCSV, buildRows };
}
