import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { profileService } from "@/services/profileService";
import { Avatar } from "@/components/ui/Avatar";
import { ROUTES } from "@/constants";

export function UserSearch() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["user-search", debounced],
    queryFn: () => profileService.search(debounced),
    enabled: debounced.length >= 2,
  });
  const results = data?.results ?? [];

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search members by name..."
        className="h-10 w-full rounded-xl border border-sand-border bg-white pl-9 pr-4 text-sm focus-visible:focus-ring"
      />
      <AnimatePresence>
        {open && debounced.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-sand-border bg-white shadow-lift">
            {isFetching ? (
              <p className="p-4 text-sm text-ink-muted">Searching...</p>
            ) : results.length === 0 ? (
              <p className="p-4 text-sm text-ink-muted">No members found for "{debounced}"</p>
            ) : (
              results.map((u) => (
                <Link key={u.id} to={ROUTES.profile(u.id)} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-sand">
                  <Avatar name={u.fullName} src={u.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.fullName}</p>
                    <p className="truncate text-xs text-ink-muted">{u.university || u.city}</p>
                  </div>
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
