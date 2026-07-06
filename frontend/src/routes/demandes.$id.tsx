import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { DemandeBadge } from "@/components/StateBadge";
import { useStore, categoryLabel } from "@/lib/ouvertures-store";
import { pickPhoto } from "@/lib/photos";
import { toast } from "sonner";
import { ArrowLeft, Camera, Check, Plus, RotateCcw, Send, X } from "lucide-react";

export const Route = createFileRoute("/demandes/$id")({
  head: () => ({ meta: [{ title: "Fiche demande — Cash Plus" }] }),
  component: DemandeDetail,
});

function DemandeDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const d = useStore((s) => s.demandes.find((x) => x.id === id));
  const role = useStore((s) => s.role);
  const update = useStore((s) => s.updateDemande);
  const validate = useStore((s) => s.validateDemande);
  const [reason, setReason] = useState("");

  if (!d) {
    return (
      <AppLayout title="Demande introuvable">
        <Link to="/demandes" className="text-primary">← Retour</Link>
      </AppLayout>
    );
  }

  const canValidate = role === "validateur";
  const canReject = role === "validateur" || role === "manager";
  const canSubmit = role === "agent" || role === "manager";
  const enoughPhotos = d.photos.length >= 5;

  return (
    <AppLayout title={`${d.reference} — ${d.owner_name}`} subtitle={`Demande d'ouverture · ${d.city ?? ""}`}>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/demandes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <DemandeBadge state={d.state} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Propriétaire</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Nom" value={d.owner_name} />
              <Field label="Téléphone" value={d.owner_phone} />
              <Field label="Email" value={d.owner_email ?? "—"} />
              <Field label="Date de demande" value={d.request_date} />
              <Field label="Date de soumission" value={d.submitted_date ?? "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Local</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Ville" value={d.city ?? "—"} />
              <Field label="Adresse" value={d.address ?? "—"} />
              <Field label="Surface" value={d.area_sqm ? `${d.area_sqm} m²` : "—"} />
              <Field label="Catégorie" value={categoryLabel[d.agency_category]} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Photos du local ({d.photos.length}/5 minimum)</CardTitle>
              {(d.state === "data_collection" || d.state === "rejected") && (
                <Button size="sm" variant="outline" onClick={() => {
                  update(d.id, { photos: [...d.photos, `photo-${d.photos.length + 1}`] });
                  toast("Photo ajoutée");
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {d.photos.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                  <Camera className="h-6 w-6 mx-auto mb-2" />
                  Aucune photo. Ajoutez au moins 5 photos pour pouvoir soumettre.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {d.photos.map((_, i) => (
                    <div key={i} className="aspect-square rounded-md overflow-hidden border bg-muted">
                      <img src={pickPhoto(d.id, i)} alt={`Photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {d.rejection_reason && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader><CardTitle className="text-base text-red-800">Motif de refus</CardTitle></CardHeader>
              <CardContent className="text-sm text-red-900">{d.rejection_reason}</CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {d.state === "data_collection" && (
              <>
                <Button className="w-full" disabled={!enoughPhotos || !canSubmit} onClick={() => {
                  update(d.id, { state: "submitted", submitted_date: new Date().toISOString().slice(0, 10) });
                  toast.success("Demande soumise pour validation");
                }}>
                  <Send className="h-4 w-4 mr-2" /> Soumettre
                </Button>
                {!enoughPhotos && <p className="text-xs text-muted-foreground">Il faut au moins 5 photos pour soumettre.</p>}
                {!canSubmit && <p className="text-xs text-muted-foreground">Seul un agent peut soumettre.</p>}
              </>
            )}
            {d.state === "submitted" && (
              <>
                <Button className="w-full" disabled={!canValidate} onClick={() => {
                  const newId = validate(d.id);
                  toast.success("Demande validée — suivi créé");
                  navigate({ to: "/suivis/$id", params: { id: newId } });
                }}>
                  <Check className="h-4 w-4 mr-2" /> Valider
                </Button>
                <div className="pt-2 border-t space-y-2">
                  <Textarea placeholder="Motif de refus" value={reason} onChange={(e) => setReason(e.target.value)} />
                  <Button variant="outline" className="w-full" disabled={!canReject || !reason} onClick={() => {
                    update(d.id, { state: "rejected", rejection_reason: reason });
                    toast("Demande refusée");
                  }}>
                    <X className="h-4 w-4 mr-2" /> Refuser
                  </Button>
                </div>
                {!canValidate && <p className="text-xs text-muted-foreground">Seul un validateur peut valider.</p>}
              </>
            )}
            {d.state === "rejected" && (
              <Button variant="outline" className="w-full" onClick={() => {
                update(d.id, { state: "data_collection", rejection_reason: undefined });
                toast("Demande rouverte");
              }}>
                <RotateCcw className="h-4 w-4 mr-2" /> Rouvrir
              </Button>
            )}
            {d.state === "validated" && (
              <p className="text-sm text-emerald-700">Demande validée — un suivi d'ouverture a été créé.</p>
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