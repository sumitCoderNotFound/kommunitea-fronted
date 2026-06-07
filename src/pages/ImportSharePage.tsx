import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUIStore } from "@/store/uiStore";
import { ROUTES } from "@/constants";

/**
 * Entry point for the PWA Web Share Target. The OS share sheet sends
 * ?title=&text=&url= here; we open the Import composer prefilled and
 * bounce to the feed so the modal sits over a real page.
 */
export function ImportSharePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setImportOpen = useUIStore((s) => s.setImportOpen);

  useEffect(() => {
    const url = params.get("url") || "";
    const text = params.get("text") || "";
    const title = params.get("title") || "";
    const initial = (url || text || title).trim();
    navigate(ROUTES.feed, { replace: true });
    if (initial) setImportOpen(true, initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
