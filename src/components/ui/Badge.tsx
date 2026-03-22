import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-[var(--success-muted)] text-[var(--success)] border-[var(--success)]/30",
  warning: "bg-[var(--warning-muted)] text-[var(--warning)] border-[var(--warning)]/30",
  error: "bg-[var(--danger-muted)] text-[var(--danger)] border-[var(--danger)]/30",
  info: "bg-[var(--info-muted)] text-[var(--info)] border-[var(--info)]/30",
};

export function Badge({ variant = "info", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
