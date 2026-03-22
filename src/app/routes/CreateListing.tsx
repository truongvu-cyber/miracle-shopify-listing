import { useState } from "react";
import { ListingForm } from "@/components/listing/ListingForm";
import { OptionBuilder } from "@/components/listing/OptionBuilder";
import { DriveScanner } from "@/components/listing/DriveScanner";
import { ImageMatchResult } from "@/components/listing/ImageMatchResult";
import { ListingQueue } from "@/components/listing/ListingQueue";
import { Button } from "@/components/ui/Button";
import { useListingStore } from "@/hooks/useListingStore";
import { useHistoryStore } from "@/hooks/useHistoryStore";
import { useImageMatcher } from "@/hooks/useImageMatcher";
import { useCSVGenerator } from "@/hooks/useCSVGenerator";
import { validateListingForm } from "@/lib/validators";
import type { ListingJob } from "@/types/listing";
import type { DriveFile } from "@/types/drive";
import { useAuthStore } from "@/hooks/useAuthStore";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { FileSpreadsheet, RotateCcw } from "lucide-react";
import { generateSlug } from "@/lib/slug";
import { rowsToCSV, type ShopifyCSVHeaderType } from "@/lib/shopify-csv";

export function CreateListing() {
  const { formData, addJob, updateJobStatus, resetForm, totalVariantCount, setFormErrors, clearFormErrors } =
    useListingStore();
  const { results, runMatch, updateManualMatch, reset: resetMatcher } =
    useImageMatcher();
  const { generating, generateCSV } = useCSVGenerator();
  const { addEntry } = useHistoryStore();
  const { user } = useAuthStore();
  const [allDriveFiles, setAllDriveFiles] = useState<DriveFile[]>([]);

  async function handleGenerateCSV() {
    clearFormErrors();

    const validation = validateListingForm({
      title: formData.title,
      skuPrefix: formData.skuPrefix,
      vendor: formData.vendor,
      tags: formData.tags,
      variantPrice: formData.variantPrice,
    });

    if (!validation.valid) {
      const errorRecord: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errorRecord[err.field] = err.message;
      });
      setFormErrors(errorRecord);
      toast.error(validation.errors[0].message);
      return;
    }

    const variantCount = totalVariantCount();
    if (variantCount === 0) {
      toast.error("Please add at least one option with values");
      return;
    }

    const jobId = crypto.randomUUID();
    const job: ListingJob = {
      id: jobId,
      title: formData.title,
      status: "processing",
      progress: 50,
      createdAt: new Date().toISOString(),
      variantCount,
    };
    addJob(job);

    try {
      const csvRows = await generateCSV(formData, results);
      if (csvRows && csvRows.length > 0) {
        updateJobStatus(jobId, "completed", {
          progress: 100,
          csvData: csvRows as Record<string, string>[],
        });

        // Lưu vào lịch sử
        addEntry({
          id: jobId,
          name: formData.title,
          sku: formData.skuPrefix,
          variantCount: variantCount,
          createdAt: new Date().toISOString(),
          csvPath: "",
          username: user?.username || "",
          csvData: csvRows as Record<string, string>[],
        });

        toast.success(`Đã tạo ${csvRows.length} dòng CSV`);
      } else {
        updateJobStatus(jobId, "failed", { errorMessage: "Không tạo được dữ liệu CSV" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      updateJobStatus(jobId, "failed", { errorMessage: msg });
      toast.error(`Lỗi: ${msg}`);
    }
  }

  async function handleDownloadJob(job: ListingJob) {
    if (!job.csvData || job.csvData.length === 0) {
      toast.error("Không có dữ liệu CSV");
      return;
    }
    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const destPath = await save({
        defaultPath: `${generateSlug(job.title)}.csv`,
        filters: [{ name: "CSV", extensions: ["csv"] }],
      });
      if (destPath) {
        const csvContent = rowsToCSV(job.csvData as Record<ShopifyCSVHeaderType, string>[]);
        await invoke("write_csv_file", { csvContent, filePath: destPath });
        toast.success(`Đã lưu tại: ${destPath}`);
      }
    } catch (err) {
      const msg = typeof err === "string" ? err : "Lỗi khi lưu file";
      toast.error(msg);
    }
  }

  function handleReset() {
    resetForm();
    resetMatcher();
    toast.info("Form reset");
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Tạo Listing Mới
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Điền thông tin sản phẩm và tạo CSV cho Shopify
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <ListingForm />
        </div>
        <div className="space-y-5">
          <OptionBuilder />
          <DriveScanner onMatchResults={runMatch} onFilesLoaded={setAllDriveFiles} matcherResults={results} />
        </div>
      </div>

      {results.length > 0 && (
        <ImageMatchResult
          results={results}
          allFiles={allDriveFiles}
          onManualMatch={updateManualMatch}
        />
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerateCSV}
          loading={generating}
        >
          <FileSpreadsheet className="h-5 w-5" />
          Tạo Listing CSV
        </Button>

        {totalVariantCount() > 0 && (
          <span className="text-sm text-[var(--text-secondary)]">
            {totalVariantCount()} variants sẽ được tạo
          </span>
        )}
      </div>

      <ListingQueue onDownload={handleDownloadJob} />
    </div>
  );
}
