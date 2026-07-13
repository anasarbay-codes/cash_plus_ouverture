import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ProspectionBadge } from "@/components/StateBadge";
import { useStore, leadSourceLabel } from "@/lib/ouvertures-store";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, ThumbsDown, ThumbsUp } from "lucide-react";

export const Route = createFileRoute("/prospections/$id")({
  head: () => ({ meta: [{ title: "Fiche prospect — Cash Plus" }] }),
  component: ProspectionDetail,
});

function ProspectionDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const p = useStore((s) => s.prospections.find((x) => x.id === id));
  const role = useStore((s) => s.role);
  const update = useStore((s) => s.updateProspection);
  const confirm = useStore((s) => s.confirmProspection);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  if (!p) {
    return (
      <AppLayout title="Prospect introuvable">
        <Link to="/prospections" className="text-primary">← Retour</Link>
      </AppLayout>
    );
  }

  const canAct = role === "agent" || role === "manager";

  return (
    <AppLayout title={p.owner_name} subtitle={`Prospect — ${p.city ?? "sans ville"}`}>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/prospections" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour à la liste
        </Link>
        <ProspectionBadge state={p.state} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Nom du propriétaire" value={p.owner_name} />
            <Field label="Téléphone" value={p.phone} />
            <Field label="CIN" value={p.national_id ?? "—"} />
            <Field label="Source" value={leadSourceLabel[p.lead_source]} />
            <Field label="Ville" value={p.city ?? "—"} />
            <Field label="Adresse" value={p.address ?? "—"} />
            <Field label="Agent assigné" value={p.assigned_agent} />
            <Field label="Créé le" value={p.created_at} />
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground mb-1">Notes</div>
              <div className="rounded-md border bg-muted/30 p-3 min-h-16">{p.notes ?? "—"}</div>
            </div>
            {p.rejection_reason && (
              <div className="col-span-2">
                <div className="text-xs text-red-700 mb-1">Motif de refus</div>
                <div className="rounded-md border border-red-200 bg-red-50 p-3">{p.rejection_reason}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {!canAct && (
              <p className="text-sm text-muted-foreground">Votre rôle ({role}) n'autorise pas d'action sur ce prospect.</p>
            )}
            {canAct && p.state === "new" && (
              <>
                <Button className="w-full" onClick={() => { update(p.id, { state: "interested" }); toast.success("Marqué comme intéressé"); }}>
                  <ThumbsUp className="h-4 w-4 mr-2" /> Marquer intéressé
                </Button>
                <RejectBlock
                  show={showReject}
                  onToggle={() => setShowReject((v) => !v)}
                  reason={reason}
                  setReason={setReason}
                  onReject={() => {
                    update(p.id, { state: "not_interested", rejection_reason: reason || "Non précisé" });
                    toast("Prospect marqué non intéressé");
                    setShowReject(false);
                  }}
                />
              </>
            )}
            {canAct && p.state === "interested" && (
              <>
                <Button className="w-full" onClick={() => {
                  const newId = confirm(p.id);
                  toast.success("Prospect confirmé — demande créée");
                  navigate({ to: "/demandes/$id", params: { id: newId } });
                }}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Confirmer
                </Button>
                <RejectBlock
                  show={showReject}
                  onToggle={() => setShowReject((v) => !v)}
                  reason={reason}
                  setReason={setReason}
                  onReject={() => {
                    update(p.id, { state: "not_interested", rejection_reason: reason || "Non précisé" });
                    toast("Prospect marqué non intéressé");
                    setShowReject(false);
                  }}
                />
              </>
            )}
            {p.state === "confirmed" && (
              <p className="text-sm text-emerald-700">Prospect confirmé — une demande d'ouverture a été créée.</p>
            )}
            {p.state === "not_interested" && (
              <p className="text-sm text-muted-foreground">Ce prospect a été marqué comme non intéressé.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}

function RejectBlock({
  show,
  onToggle,
  reason,
  setReason,
  onReject,
}: {
  show: boolean;
  onToggle: () => void;
  reason: string;
  setReason: (s: string) => void;
  onReject: () => void;
}) {
  return (
    <div className="space-y-2 pt-2 border-t">
      <Button variant="outline" className="w-full" onClick={onToggle}>
        <ThumbsDown className="h-4 w-4 mr-2" /> Marquer non intéressé
      </Button>
      {show && (
        <div className="space-y-2">
          <Textarea
            placeholder="Motif de refus (optionnel)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
          <Button variant="destructive" className="w-full" onClick={onReject}>
            <ThumbsDown className="h-4 w-4 mr-2" /> Confirmer le refus
          </Button>
        </div>
      )}
    </div>
  );
}