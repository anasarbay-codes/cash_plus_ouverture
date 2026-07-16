import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemandeBadge } from "@/components/StateBadge";
import { useStore, categoryLabel, type AgencyCategory } from "@/lib/ouvertures-store";
import { useAuthStore } from "@/lib/auth-store";
import { useDemandes } from "@/lib/use-store";
import { photoUrl } from "@/lib/photos";
import { toast } from "sonner";
import { PhotoImg } from "@/components/PhotoImg";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { ArrowLeft, Camera, Check, Plus, RotateCcw, Save, Send, X } from "lucide-react";

export const Route = createFileRoute("/demandes/$id")({
  head: () => ({ meta: [{ title: "Fiche demande — Cash Plus" }] }),
  component: DemandeDetail,
});

function DemandeDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const demandes = useDemandes();
  const d = demandes.find((x) => x.id === Number(id));
  const role = useAuthStore((s) => s.role);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [form, setForm] = useState({
    ownerEmail: "",
    address: "",
    city: "",
    area_sqm: "",
    agency_category: "",
  });

  useEffect(() => {
    useStore.loadDemandes();
  }, []);

  useEffect(() => {
    if (d) {
      setForm({
        ownerEmail: d.owner_email ?? "",
        address: d.address ?? "",
        city: d.city ?? "",
        area_sqm: d.area_sqm ? String(d.area_sqm) : "",
        agency_category: d.agency_category ?? "",
      });
    }
  }, [d?.id, d?.state]);

  if (!d) {
    return (
      <AppLayout title="Demande introuvable">
        <Link to="/demandes" className="text-primary">Retour</Link>
      </AppLayout>
    );
  }

  const canValidate = role === "VALIDATEUR";
  const canReject = role === "VALIDATEUR" || role === "MANAGER";
  const canSubmit = role === "VALIDATEUR" || role === "MANAGER";
  const enoughPhotos = d.photo_count >= 5;
  const canEdit = d.state === "DATA_COLLECTION" || d.state === "REJECTED";
  const canUploadPhoto = canEdit && (role === "VALIDATEUR" || role === "MANAGER");

  return (
    <>
    <AppLayout title={`${d.reference} - ${d.owner_name}`} subtitle={`Demande d'ouverture - ${d.city ?? ""}`}>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/demandes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <DemandeBadge state={d.state} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Proprietaire</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Nom" value={d.owner_name} />
              <Field label="Telephone" value={d.owner_phone} />
              {editing ? (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Email</div>
                  <Input value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} placeholder="Email" />
                </div>
              ) : (
                <Field label="Email" value={d.owner_email ?? "-"} />
              )}
              <Field label="Date de demande" value={d.request_date} />
              <Field label="Date de soumission" value={d.submitted_date ?? "-"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Local</CardTitle>
              {canEdit && !editing && (
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditing(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              {canEdit && editing && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(false); setForm({ ownerEmail: d.owner_email ?? "", address: d.address ?? "", city: d.city ?? "", area_sqm: d.area_sqm ? String(d.area_sqm) : "", agency_category: d.agency_category ?? "" }); }}>
                    Annuler
                  </Button>
                  <Button size="sm" onClick={async () => {
                    await useStore.updateDemande(d.id, {
                      owner_email: form.ownerEmail || undefined,
                      address: form.address || undefined,
                      city: form.city || undefined,
                      area_sqm: form.area_sqm ? Number(form.area_sqm) : undefined,
                      agency_category: (form.agency_category || undefined) as AgencyCategory | undefined,
                    });
                    toast.success("Informations enregistrées");
                    setEditing(false);
                  }}>
                    <Save className="h-4 w-4 mr-1" /> Enregistrer
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              {editing ? (
                <>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Ville</div>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ville" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Adresse</div>
                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Adresse" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Surface (m²)</div>
                    <Input type="number" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: e.target.value })} placeholder="Surface" min="0" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Catégorie</div>
                    <Select value={form.agency_category} onValueChange={(v) => setForm({ ...form, agency_category: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="HOT_SPOT">Hot spot</SelectItem>
                        <SelectItem value="RURAL">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <Field label="Ville" value={d.city ?? "-"} />
                  <Field label="Adresse" value={d.address ?? "-"} />
                  <Field label="Surface" value={d.area_sqm ? `${d.area_sqm} m2` : "-"} />
                  <Field label="Catégorie" value={d.agency_category ? categoryLabel[d.agency_category] : "-"} />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Photos du local ({d.photo_count}/5 minimum)</CardTitle>
              {canUploadPhoto && (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await useStore.uploadDemandePhoto(d.id, file);
                      toast("Photo ajoutee");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  />
                  <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </div>
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
                  {d.photos.map((photo, i) => (
                    <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden border bg-muted group">
                      <PhotoImg src={photoUrl(d.id, photo)} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" onClick={() => setLightboxSrc(photoUrl(d.id, photo))} />
                      {canUploadPhoto && (
                        <button
                          type="button"
                          onClick={async () => {
                            await useStore.deleteDemandePhoto(d.id, photo.id);
                            toast("Photo supprimee");
                          }}
                          className="absolute top-1 right-1 p-1 rounded bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
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
            {d.state === "DATA_COLLECTION" && (
              <>
                <Button className="w-full" disabled={!enoughPhotos || !canSubmit} onClick={async () => {
                  await useStore.submitDemande(d.id);
                  toast.success("Demande soumise pour validation");
                }}>
                  <Send className="h-4 w-4 mr-2" /> Soumettre
                </Button>
                {!enoughPhotos && <p className="text-xs text-muted-foreground">Il faut au moins 5 photos pour soumettre.</p>}
                {!canSubmit && <p className="text-xs text-muted-foreground">Seul un validateur peut soumettre.</p>}
              </>
            )}
            {d.state === "SUBMITTED" && (
              <>
                <Button className="w-full" disabled={!canValidate} onClick={async () => {
                  await useStore.validateDemande(d.id);
                  toast.success("Demande validee - suivi cree");
                  navigate({ to: "/suivis" });
                }}>
                  <Check className="h-4 w-4 mr-2" /> Valider
                </Button>
                <div className="pt-2 border-t space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!canReject}
                    onClick={() => setShowReject((v) => !v)}
                  >
                    <X className="h-4 w-4 mr-2" /> Refuser
                  </Button>
                  {showReject && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Motif de refus"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        autoFocus
                      />
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={!reason}
                        onClick={async () => {
                          await useStore.rejectDemande(d.id, reason);
                          toast("Demande refusee");
                          setShowReject(false);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" /> Confirmer le refus
                      </Button>
                    </div>
                  )}
                </div>
                {!canValidate && <p className="text-xs text-muted-foreground">Seul un validateur peut valider.</p>}
              </>
            )}
            {d.state === "REJECTED" && (
              <Button variant="outline" className="w-full" onClick={async () => {
                await useStore.reopenDemande(d.id);
                toast("Demande rouverte");
              }}>
                <RotateCcw className="h-4 w-4 mr-2" /> Rouvrir
              </Button>
            )}
            {d.state === "VALIDATED" && (
              <p className="text-sm text-emerald-700">Demande validee - un suivi d'ouverture a ete cree.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
    <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
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
