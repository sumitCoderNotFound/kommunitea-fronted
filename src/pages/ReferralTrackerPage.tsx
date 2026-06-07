import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Users, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { referralService } from "@/services/referralService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import { listStagger, popIn } from "@/utils/motion";
import type { ReferralRequest, ReferralStatus } from "@/types";

const STATUS: Record<ReferralStatus, { label: string; chip: string }> = {
  not_requested: { label: "Not requested", chip: "bg-slate-500/10 text-slate-500" },
  requested:     { label: "Requested",     chip: "bg-sky-500/10 text-sky-500" },
  follow_up:     { label: "Follow-up needed", chip: "bg-coral/10 text-coral" },
  referred:      { label: "Referred",      chip: "bg-emerald-500/10 text-emerald-600" },
  declined:      { label: "Declined",      chip: "bg-rose-500/10 text-rose-500" },
  no_response:   { label: "No response",   chip: "bg-amber-500/10 text-amber-600" },
};
const STATUS_OPTIONS = (Object.keys(STATUS) as ReferralStatus[]).map((v) => ({ value: v, label: STATUS[v].label }));

function template(r: { contactName?: string; company: string; roleTitle?: string }) {
  return `Hi ${r.contactName || "there"}, I hope you're well! I'm applying for the ${r.roleTitle || "open"} role at ${r.company} and noticed you work there. Would you be open to referring me or sharing any tips? Happy to send my CV. Thanks so much!`;
}

export function ReferralTrackerPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<ReferralRequest>>({ status: "not_requested" });

  // Prefill + open the Add modal when arriving from a job ("Ask for referral").
  useEffect(() => {
    const company = params.get("company");
    const role = params.get("role");
    if (company || role) {
      setForm({ status: "requested", company: company ?? "", roleTitle: role ?? "" });
      setOpen(true);
    }
  }, [params]);

  const { data, isLoading } = useQuery({ queryKey: ["referrals"], queryFn: referralService.list });
  const referrals = data?.results ?? [];

  const create = useMutation({
    mutationFn: () => referralService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["referrals"] }); setOpen(false); setForm({ status: "not_requested" }); toast.success("Referral added"); },
    onError: (e) => toast.error("Couldn't add: " + (e as Error).message),
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ReferralRequest> }) => referralService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referrals"] }),
    onError: (e) => toast.error("Couldn't update: " + (e as Error).message),
  });

  const copyTemplate = (r: ReferralRequest) => {
    navigator.clipboard?.writeText(template(r)).then(() => toast.success("Message copied")).catch(() => {});
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate(-1)} className="mb-3 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Referral Tracker</h1>
          <p className="text-sm text-ink-muted">Keep tabs on who you've asked for a referral.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {isLoading ? <Loader /> : referrals.length === 0 ? (
        <EmptyState icon={Users} title="No referrals tracked yet"
          description="Add a company and contact to start tracking your referral asks."
          action={<Button onClick={() => setOpen(true)}>Add a referral</Button>} />
      ) : (
        <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-3">
          {referrals.map((r) => (
            <motion.div key={r.id} variants={popIn}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{r.roleTitle || "Role"} <span className="font-normal text-ink-muted">@ {r.company}</span></p>
                    {r.contactName && <p className="text-sm text-ink-soft">Contact: {r.contactName}</p>}
                    {r.followUpDate && <p className="text-xs text-coral">Follow up: {r.followUpDate}</p>}
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS[r.status]?.chip)}>
                    {STATUS[r.status]?.label}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Select className="h-9 w-auto" options={STATUS_OPTIONS} value={r.status}
                    onChange={(e) => update.mutate({ id: r.id, patch: { status: e.target.value as ReferralStatus } })} />
                  <Button size="sm" variant="outline" onClick={() => copyTemplate(r)}>
                    <Copy className="h-4 w-4" /> Copy message
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add referral">
        <div className="space-y-3">
          <Input label="Company" value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Input label="Role title" value={form.roleTitle ?? ""} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} />
          <Input label="Contact name" value={form.contactName ?? ""} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          <Input label="Contact LinkedIn" value={form.contactLinkedin ?? ""} onChange={(e) => setForm({ ...form, contactLinkedin: e.target.value })} />
          <Select label="Status" options={STATUS_OPTIONS} value={form.status ?? "not_requested"}
            onChange={(e) => setForm({ ...form, status: e.target.value as ReferralStatus })} />
          <Input label="Follow-up date" type="date" value={form.followUpDate ?? ""} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
          <Textarea label="Notes" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button fullWidth disabled={!form.company} isLoading={create.isPending} onClick={() => create.mutate()}>Save referral</Button>
        </div>
      </Modal>
    </div>
  );
}
