import { useMemo, useState } from "react";
import { Shuffle, Check } from "lucide-react";
import { cn } from "@/utils/cn";

// Free, no-key avatar generation via DiceBear (open source).
const STYLES = ["avataaars", "notionists", "fun-emoji", "bottts", "thumbs", "lorelei"];

function svgUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
function pngUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(seed)}&size=256`;
}

interface AvatarPickerProps {
  /** Receives a ready-to-upload PNG File when the user confirms a pick. */
  onPick: (file: File) => void;
  seedBase?: string;
}

/** Grid of generated avatars. Pick a style + face, then it hands back a PNG File. */
export function AvatarPicker({ onPick, seedBase = "kommunitea" }: AvatarPickerProps) {
  const [style, setStyle] = useState(STYLES[0]);
  const [salt, setSalt] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 8 seeds per refresh
  const seeds = useMemo(
    () => Array.from({ length: 8 }, (_, i) => `${seedBase}-${salt}-${i}`),
    [seedBase, salt],
  );

  const confirm = async (seed: string) => {
    try {
      setLoading(true);
      setSelected(seed);
      const res = await fetch(pngUrl(style, seed));
      const blob = await res.blob();
      const file = new File([blob], `avatar-${style}-${seed}.png`, { type: "image/png" });
      onPick(file);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-sand-border bg-sand-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-soft">Pick an avatar</span>
        <button type="button" onClick={() => setSalt((s) => s + 1)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-coral hover:bg-coral/10">
          <Shuffle className="h-3.5 w-3.5" /> Shuffle
        </button>
      </div>
      {/* style selector */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {STYLES.map((s) => (
          <button type="button" key={s} onClick={() => setStyle(s)}
            className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors",
              style === s ? "bg-coral text-white" : "bg-sand text-ink-soft hover:bg-ink/5")}>
            {s.replace("-", " ")}
          </button>
        ))}
      </div>
      {/* avatar grid */}
      <div className="grid grid-cols-4 gap-2">
        {seeds.map((seed) => (
          <button type="button" key={seed} onClick={() => confirm(seed)} disabled={loading}
            className={cn("relative aspect-square overflow-hidden rounded-xl border-2 bg-sand transition-all hover:scale-105",
              selected === seed ? "border-coral" : "border-transparent")}>
            <img src={svgUrl(style, seed)} alt="avatar option" className="h-full w-full" loading="lazy" />
            {selected === seed && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-white">
                <Check className="h-3 w-3" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
