import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-brand ${
            error ? "border-down" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-down">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
