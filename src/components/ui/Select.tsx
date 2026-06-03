import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";

interface Option { value: string; label: string; }
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const sId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={sId} className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={sId}
            className={cn(
              "h-11 w-full appearance-none rounded-xl border bg-sand-card px-4 pr-10 text-sm text-ink",
              "transition-colors focus-visible:focus-ring",
              error ? "border-red-400" : "border-sand-border focus:border-coral",
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";
