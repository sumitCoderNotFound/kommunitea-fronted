import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Globe2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { studyMatchService, CountryScore } from "@/services/studyMatchService";

const ALL = ["UK", "Canada", "Germany", "Australia", "Ireland", "USA", "New Zealand"];

export function StudyMatchCountriesPage() {
  const [selected, setSelected] = useState<string[]>(["UK", "Canada", "Germany"]);
  const compare = useMutation({ mutationFn: (c: string[]) => studyMatchService.compare(c) });
  const rows: CountryScore[] = compare.data?.comparison || [];

  const toggle = (c: string) => setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><Globe2 className="h-6 w-6 text-coral" /> Compare countries</h1>
      <p className="mt-1 text-ink-muted">Best-fit is based on your profile — no country is universally best.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {ALL.map((c) => (
          <button key={c} onClick={() => toggle(c)}
            className={`rounded-full border px-3.5 py-1.5 text-sm ${selected.includes(c) ? "border-coral bg-coral text-white" : "border-sand-border bg-sand-card text-ink"}`}>{c}</button>
        ))}
      </div>
      <Button className="mt-4" disabled={selected.length < 2 || compare.isPending} onClick={() => compare.mutate(selected)}>
        {compare.isPending ? "Comparing…" : "Compare"}
      </Button>

      {rows.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.sort((a, b) => b.score - a.score).map((c, idx) => (
            <div key={c.country} className="rounded-2xl border border-sand-border bg-sand-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-ink">{c.name}</h3>
                {idx === 0 && <span className="rounded-full bg-coral/10 px-2 py-0.5 text-xs font-medium text-coral">Best fit for you</span>}
              </div>
              <p className="mt-1 text-2xl font-bold text-coral">{c.score}<span className="text-sm text-ink-muted">/100</span></p>
              <dl className="mt-3 space-y-1 text-xs text-ink">
                <div className="flex justify-between"><dt className="text-ink-muted">Cost</dt><dd>{c.costLevel}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Job market</dt><dd>{c.jobMarketStrength}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Post-study</dt><dd className="text-right">{c.visaNotes}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Settlement</dt><dd className="text-right">{c.settlement}</dd></div>
              </dl>
              {c.whyItFits[0] && <p className="mt-2 text-xs text-ink">✓ {c.whyItFits[0]}</p>}
              {c.risks[0] && <p className="mt-1 text-xs text-amber-600">Watch: {c.risks[0]}</p>}
            </div>
          ))}
        </div>
      )}
      <p className="mt-6 rounded-xl border border-sand-border bg-sand px-4 py-3 text-xs text-ink-muted">
        Always confirm current costs, fees and visa rules from official sources.
      </p>
    </div>
  );
}
