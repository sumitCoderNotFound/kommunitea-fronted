import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-soft">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border bg-sand-card px-4 text-sm text-ink placeholder:text-ink-muted/60",
            "transition-colors focus-visible:focus-ring",
            error ? "border-red-400" : "border-sand-border focus:border-coral",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-ink-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
