import { useListingStore } from "@/hooks/useListingStore";
import { ListingCard } from "./ListingCard";
import type { ListingJob } from "@/types/listing";
import { ListChecks } from "lucide-react";

interface ListingQueueProps {
  onDownload: (job: ListingJob) => void;
}

export function ListingQueue({ onDownload }: ListingQueueProps) {
  const { jobs, removeJob } = useListingStore();

  if (jobs.length === 0) {
    return (
      <div className="flex items-center gap-3 p-6 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]">
        <ListChecks className="h-5 w-5 text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-muted)]">
          Chưa có listing nào. Tạo listing để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
          Hàng đợi Listing ({jobs.length})
        </h3>
      </div>
      <div className="space-y-2">
        {jobs.map((job) => (
          <ListingCard
            key={job.id}
            job={job}
            onDownload={onDownload}
            onRemove={removeJob}
          />
        ))}
      </div>
    </div>
  );
}
