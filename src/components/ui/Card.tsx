import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  padding?: boolean;
  shadow?: boolean;
}

export function Card({
  title,
  children,
  className = "",
  padding = true,
  shadow: _shadow = true,
}: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] shadow-[var(--shadow-sm)]
        ${className}
      `}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
      )}
      <div className={padding ? "p-5" : ""}>{children}</div>
    </div>
  );
}
