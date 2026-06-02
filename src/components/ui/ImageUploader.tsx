import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface ImageUploaderProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export function ImageUploader({ onChange, className }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    onChange(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className={className}>
      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-sand-border">
          <img src={preview} alt="preview" className="max-h-72 w-full object-cover" />
          <button
            type="button"
            onClick={() => handleFile(null)}
            className="absolute right-2 top-2 rounded-full bg-ink/70 p-1.5 text-white hover:bg-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sand-border",
            "bg-sand/50 py-8 text-ink-muted transition-colors hover:border-coral hover:text-coral",
          )}
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-sm font-medium">Add an image</span>
          <span className="text-xs">PNG or JPG, up to 5MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
