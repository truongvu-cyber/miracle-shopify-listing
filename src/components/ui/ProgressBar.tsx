interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const heightClass = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>Progress</span>
          <span className="font-medium text-[var(--text-secondary)]">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-[var(--border)] rounded-full overflow-hidden ${heightClass}`}
      >
        <div
          className={`${heightClass} bg-[var(--brand)] rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
