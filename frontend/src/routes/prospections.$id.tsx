import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProspectionBadge } from "@/components/StateBadge";
import { useStore, leadSourceLabel, type LeadSource } from "@/lib/ouvertures-store";
import { useAuthStore } from "@/lib/auth-store";
import { useProspections } from "@/lib/use-store";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Edit3, ThumbsDown, ThumbsUp } from "lucide-react";

export const Route = createFileRoute("/prospections/$id")({
  head: () => ({ meta: [{ title: "Fiche prospect — Cash Plus" }] }),
  component: ProspectionDetail,
});

function ProspectionDetail() {
  const { id } = Route.useParams();
  const prospections = useProspections();
  const p = prospections.find((x) => x.id === Number(id));
  const role = useAuthStore((s) => s.role);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNationalId, setEditNationalId] = useState("");
  const [editLeadSource, setEditLeadSource] = useState<LeadSource>("WALK_IN");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    useStore.loadProspections();
  }, []);

  useEffect(() => {
    if (p) {
      setEditOwnerName(p.owner_name);
      setEditPhone(p.phone);
      setEditCity(p.city ?? "");
      setEditAddress(p.address ?? "");
      setEditNationalId(p.national_id ?? "");
      setEditLeadSource(p.lead_source);
      setEditNotes(p.notes ?? "");
    }
  }, [p]);

  if (!p) {
    return (
      <AppLayout title="Prospect introuvable">
        <Link to="/prospections" className="text-primary">← Retour</Link>
      </AppLayout>
    );
  }

  const canAct = role === "AGENT" || role === "MANAGER";

  const handleSave = async () => {
    await useStore.updateProspection(p!.id, {
      owner_name: editOwnerName,
      phone: editPhone,
      lead_source: editLeadSource,
      city: editCity,
      address: editAddress || undefined,
      national_id: editNationalId || undefined,
      notes: editNotes,
    });
    toast.success("Prospection mise à jour");
    setEditing(false);
  };

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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Informations</CardTitle>
            {canAct && (p.state === "NEW" || p.state === "INTERESTED") && (
              <Button variant="ghost" size="icon" onClick={() => {
                if (editing) {
                  handleSave();
                } else {
                  setEditing(true);
                }
              }}>
                {editing ? "✓" : <Edit3 className="h-4 w-4" />}
              </Button>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            {editing ? (
              <>
                <EditField label="Nom du propriétaire">
                  <Input value={editOwnerName} onChange={(e) => setEditOwnerName(e.target.value)} />
                </EditField>
                <EditField label="Téléphone">
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </EditField>
                <EditField label="CIN">
                  <Input value={editNationalId} onChange={(e) => setEditNationalId(e.target.value)} />
                </EditField>
                <EditField label="Source">
                  <Select value={editLeadSource} onValueChange={(v) => setEditLeadSource(v as LeadSource)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WALK_IN">Visite</SelectItem>
                      <SelectItem value="WEBSITE">Site web</SelectItem>
                      <SelectItem value="FACEBOOK">Facebook</SelectItem>
                      <SelectItem value="PHONE">Téléphone</SelectItem>
                      <SelectItem value="OTHER">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </EditField>
                <EditField label="Ville">
                  <Input value={editCity} onChange={(e) => setEditCity(e.target.value)} />
                </EditField>
                <EditField label="Adresse">
                  <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
                </EditField>
                <Field label="Agent assigné" value={p.assigned_agent_name} />
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground mb-1">Notes</div>
                  <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <Field label="Nom du propriétaire" value={p.owner_name} />
                <Field label="Téléphone" value={p.phone} />
                <Field label="CIN" value={p.national_id ?? "—"} />
                <Field label="Source" value={leadSourceLabel[p.lead_source]} />
                <Field label="Ville" value={p.city ?? "—"} />
                <Field label="Adresse" value={p.address ?? "—"} />
                <Field label="Agent assigné" value={p.assigned_agent_name} />
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground mb-1">Notes</div>
                  <div className="rounded-md border bg-muted/30 p-3 min-h-16">{p.notes ?? "—"}</div>
                </div>
              </>
            )}
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
            {canAct && p.state === "NEW" && (
              <>
                <Button className="w-full" onClick={async () => {
                  await useStore.updateProspection(p.id, { state: "INTERESTED" });
                  toast.success("Marqué comme intéressé");
                }}>
                  <ThumbsUp className="h-4 w-4 mr-2" /> Marquer intéressé
                </Button>
                <RejectBlock
                  show={showReject}
                  onToggle={() => setShowReject((v) => !v)}
                  reason={reason}
                  setReason={setReason}
                  onReject={async () => {
                    await useStore.updateProspection(p.id, { state: "NOT_INTERESTED", rejection_reason: reason || "Non précisé" });
                    toast("Prospect marqué non intéressé");
                    setShowReject(false);
                  }}
                />
              </>
            )}
            {canAct && p.state === "INTERESTED" && (
              <>
                <Button className="w-full" onClick={async () => {
                  await useStore.confirmProspection(p.id);
                  toast.success("Prospect confirmé — demande créée");
                }}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Confirmer
                </Button>
                <RejectBlock
                  show={showReject}
                  onToggle={() => setShowReject((v) => !v)}
                  reason={reason}
                  setReason={setReason}
                  onReject={async () => {
                    await useStore.updateProspection(p.id, { state: "NOT_INTERESTED", rejection_reason: reason || "Non précisé" });
                    toast("Prospect marqué non intéressé");
                    setShowReject(false);
                  }}
                />
              </>
            )}
            {p.state === "CONFIRMED" && (
              <p className="text-sm text-emerald-700">Prospect confirmé — une demande d'ouverture a été créée.</p>
            )}
            {p.state === "NOT_INTERESTED" && (
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

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {children}
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
