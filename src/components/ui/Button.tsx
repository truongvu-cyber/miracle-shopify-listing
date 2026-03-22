import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)] shadow-sm",
  secondary:
    "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] active:bg-[var(--bg-surface-active)] border border-[var(--border)]",
  danger:
    "bg-[var(--danger)] text-[var(--text-on-brand)] hover:bg-[var(--danger-hover)] active:bg-[var(--danger-hover)] shadow-sm",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] active:bg-[var(--bg-surface-active)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
  md: "px-4 py-2 text-sm rounded-lg gap-2",
  lg: "px-6 py-2.5 text-base rounded-lg gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-150 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-[var(--ring-offset)]
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer select-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
