import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 text-sm rounded-lg border
            bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--border-focus)]
            ${error ? "border-[var(--danger)] focus:ring-[var(--danger)] focus:border-[var(--danger)]" : "border-[var(--border)] hover:border-[var(--border-hover)]"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
