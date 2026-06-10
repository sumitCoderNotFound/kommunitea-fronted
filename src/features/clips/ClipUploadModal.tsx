import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { useToast } from "@/hooks/useToast";
import { clipsService, CLIP_CATEGORIES } from "@/services/clipsService";

const CATEGORY_OPTIONS = CLIP_CATEGORIES.filter((c) => c.value).map((c) => c.label);
const VISIBILITY = ["Public", "Followers only", "Community only", "Private"];
const VIS_VALUE: Record<string, string> = {
  "Public": "public", "Followers only": "followers_only", "Community only": "community_only", "Private": "private",
};
const MAX_SECONDS = 60;
const MAX_BYTES = 100 * 1024 * 1024;

export function ClipUploadModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [caption, setCaption] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("UK Life");
  const [visLabel, setVisLabel] = useState("Public");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  const pick = (f: File | null) => {
    setError("");
    if (!f) return;
    if (f.size > MAX_BYTES) { setError("Video must be 100MB or smaller."); return; }
    if (!/\.(mp4|mov)$/i.test(f.name) && !["video/mp4", "video/quicktime"].includes(f.type)) {
      setError("Only MP4 or MOV files are supported."); return;
    }
    // Read duration from metadata before allowing upload.
    const url = URL.createObjectURL(f);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (v.duration > MAX_SECONDS) { setError(`Clips must be ${MAX_SECONDS} seconds or shorter (this is ${Math.round(v.duration)}s).`); setFile(null); return; }
      setDuration(Math.round(v.duration));
      setFile(f);
    };
    v.onerror = () => { setError("Couldn't read that video."); };
    v.src = url;
  };

  const submit = async () => {
    if (!file) { setError("Choose a video first."); return; }
    const catValue = CLIP_CATEGORIES.find((c) => c.label === categoryLabel)?.value ?? "uk_life";
    const form = new FormData();
    form.append("video_file", file);
    form.append("caption", caption);
    form.append("category", catValue);
    form.append("visibility", VIS_VALUE[visLabel]);
    form.append("duration_seconds", String(duration));
    form.append("file_size", String(file.size));
    setProgress(0);
    try {
      await clipsService.upload(form, setProgress);
      qc.invalidateQueries({ queryKey: ["clips-feed"] });
      toast.success("Clip uploaded!");
      onClose();
    } catch (e: any) {
      setProgress(null);
      const msg = e?.response?.data?.detail || e?.response?.data?.durationSeconds?.[0] || "Upload failed. Please try again.";
      setError(typeof msg === "string" ? msg : "Upload failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-sand-card p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Upload a clip</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-5 w-5" /></button>
        </div>

        <button onClick={() => fileRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-sand-border py-8 text-ink-muted hover:border-coral">
          <UploadCloud className="h-7 w-7" />
          <span className="text-sm">{file ? `${file.name} (${duration}s)` : "Choose MP4 / MOV — up to 60s, 100MB"}</span>
        </button>
        <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,.mp4,.mov" className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)} />

        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption…" rows={2}
          className="mt-3 w-full rounded-xl border border-sand-border bg-sand px-3 py-2 text-sm focus-visible:focus-ring" />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Combobox label="Category" value={categoryLabel} onChange={setCategoryLabel} options={CATEGORY_OPTIONS} />
          <Combobox label="Visibility" value={visLabel} onChange={setVisLabel} options={VISIBILITY} />
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        {progress !== null && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand-border">
            <div className="h-full bg-coral transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} isLoading={progress !== null} disabled={!file}>Upload</Button>
        </div>
      </div>
    </div>
  );
}
