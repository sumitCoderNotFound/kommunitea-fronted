import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const tId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={tId} className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>
        )}
        <textarea
          ref={ref}
          id={tId}
          className={cn(
            "min-h-[110px] w-full resize-y rounded-xl border bg-sand-card px-4 py-3 text-sm text-ink",
            "placeholder:text-ink-muted/60 transition-colors focus-visible:focus-ring",
            error ? "border-red-400" : "border-sand-border focus:border-coral",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
