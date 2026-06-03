import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile } from "lucide-react";
import { cn } from "@/utils/cn";

// Lightweight emoji picker (no external dependency).
const GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Smileys", emojis: ["😀","😁","😂","🤣","😊","😍","😘","😎","🤩","😅","🙂","😉","😌","😋","🤔","🤗","🙃","😴","😇","🥰"] },
  { label: "Gestures", emojis: ["👍","👎","👏","🙌","🙏","💪","🤝","👊","✌️","🤞","👌","🫶","🤙","👋","💯","🔥","✨","⭐","🎉","🎊"] },
  { label: "Hearts", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💖","💗","💓","💞","💕","💔","❣️","💘","💝","😻","🥹","🫶"] },
  { label: "Study", emojis: ["🎓","📚","📝","💼","💻","🚀","📈","🏆","🎯","💡","☕","🍵","🏠","🛂","📅","🤓","🧠","⏰","✅","📌"] },
];

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ onPick, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState(0);

  return (
    <div className={cn("relative", className)}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-coral">
        <Smile className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-11 right-0 z-50 w-64 rounded-2xl border border-sand-border bg-sand-card p-3 shadow-lift">
              <div className="mb-2 flex gap-1">
                {GROUPS.map((g, i) => (
                  <button key={g.label} onClick={() => setGroup(i)}
                    className={cn("rounded-lg px-2 py-1 text-[11px] font-medium",
                      group === i ? "bg-coral/10 text-coral" : "text-ink-muted hover:bg-ink/5")}>
                    {g.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {GROUPS[group].emojis.map((e) => (
                  <motion.button key={e} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.8 }}
                    onClick={() => { onPick(e); setOpen(false); }}
                    className="rounded-lg p-1 text-xl hover:bg-sand">{e}</motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
