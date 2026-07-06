import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SuiviBadge } from "@/components/StateBadge";
import { useStore, suiviSteps, suiviStateLabel, categoryLabel } from "@/lib/ouvertures-store";
import { pickPhoto, agencyThumb } from "@/lib/photos";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Camera, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/suivis/$id")({
  head: () => ({ meta: [{ title: "Fiche suivi — Cash Plus" }] }),
  component: SuiviDetail,
});

function SuiviDetail() {
  const { id } = Route.useParams();
  const s = useStore((st) => st.suivis.find((x) => x.id === id));
  const role = useStore((st) => st.role);
  const update = useStore((st) => st.updateSuivi);

  if (!s) {
    return (
      <AppLayout title="Suivi introuvable">
        <Link to="/suivis" className="text-primary">← Retour</Link>
      </AppLayout>
    );
  }

  const currentIdx = suiviSteps.indexOf(s.state);

  return (
    <AppLayout title={s.agency_name} subtitle={`${s.reference} · ${s.city ?? ""} · ${categoryLabel[s.agency_category]}`}>
      <div className="mb-6 overflow-hidden rounded-lg border">
        <img src={agencyThumb(s.id)} alt={s.agency_name} width={1600} height={400} className="w-full h-40 md:h-56 object-cover" />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/suivis" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <SuiviBadge state={s.state} />
      </div>

      {/* Stepper */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center">
            {suiviSteps.map((step, i) => {
              const done = i < currentIdx || s.state === "live";
              const active = i === currentIdx && s.state !== "live";
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium border-2",
                      done && "bg-emerald-500 border-emerald-500 text-white",
                      active && "bg-primary border-primary text-primary-foreground",
                      !done && !active && "bg-background border-border text-muted-foreground",
                    )}>
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <div className={cn("text-xs whitespace-nowrap", active ? "text-foreground font-medium" : "text-muted-foreground")}>{suiviStateLabel[step]}</div>
                  </div>
                  {i < suiviSteps.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-2 mb-5", done ? "bg-emerald-500" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Préparation & documents</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ToggleRow label="Documents légaux prêts" hint="Bail, CIN, registre de commerce, attestation bancaire..." checked={s.legal_documents_ready} onChange={(v) => update(s.id, { legal_documents_ready: v })} />
              <ToggleRow label="Local aménagé / prêt" checked={s.fit_out_ready} onChange={(v) => update(s.id, { fit_out_ready: v })} />
              <ToggleRow label="Réseau & code agence configurés" checked={s.network_setup_ready} onChange={(v) => update(s.id, { network_setup_ready: v })} />
              <ToggleRow label="Conformité vérifiée par le manager" checked={s.compliance_checked} onChange={(v) => update(s.id, { compliance_checked: v })} />
              <ToggleRow label="Installation sur site terminée" checked={s.installation_done} onChange={(v) => update(s.id, { installation_done: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Photos d'aménagement ({s.fit_out_photos.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={() => {
                update(s.id, { fit_out_photos: [...s.fit_out_photos, `p-${s.fit_out_photos.length + 1}`] });
                toast("Photo ajoutée");
              }}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              {s.fit_out_photos.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                  <Camera className="h-6 w-6 mx-auto mb-2" />
                  Au moins 1 photo requise avant de terminer la codification.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {s.fit_out_photos.map((_, i) => (
                    <div key={i} className="aspect-square rounded-md overflow-hidden border bg-muted">
                      <img src={pickPhoto(s.id, i)} alt={`Photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader><CardTitle className="text-base">Action courante</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {s.state === "preparation" && (
              <>
                <p className="text-sm text-muted-foreground">Étape : préparation des documents.</p>
                <Button className="w-full" disabled={role !== "manager" || !s.legal_documents_ready} onClick={() => {
                  update(s.id, { state: "codification" }); toast.success("Préparation terminée");
                }}>
                  <ArrowRight className="h-4 w-4 mr-2" /> Terminer la préparation
                </Button>
                {role !== "manager" && <p className="text-xs text-muted-foreground">Réservé au Manager.</p>}
              </>
            )}
            {s.state === "codification" && (
              <>
                <p className="text-sm text-muted-foreground">Étape : codification (aménagement + réseau).</p>
                <Button className="w-full" disabled={role !== "agent" || !s.fit_out_ready || s.fit_out_photos.length < 1 || !s.network_setup_ready} onClick={() => {
                  update(s.id, { state: "control" }); toast.success("Codification terminée");
                }}>
                  <ArrowRight className="h-4 w-4 mr-2" /> Terminer la codification
                </Button>
                {role !== "agent" && <p className="text-xs text-muted-foreground">Réservé à l'Agent.</p>}
              </>
            )}
            {s.state === "control" && (
              <>
                <p className="text-sm text-muted-foreground">Étape : contrôle de conformité.</p>
                <Button className="w-full" disabled={role !== "manager" || !s.compliance_checked} onClick={() => {
                  update(s.id, { state: "installation" }); toast.success("Installation lancée");
                }}>
                  <ArrowRight className="h-4 w-4 mr-2" /> Lancer l'installation
                </Button>
                {role !== "manager" && <p className="text-xs text-muted-foreground">Réservé au Manager.</p>}
              </>
            )}
            {s.state === "installation" && (
              <>
                <p className="text-sm text-muted-foreground">Étape : installation sur site.</p>
                <Button className="w-full" disabled={role !== "agent" || !s.installation_done} onClick={() => {
                  update(s.id, { state: "live", start_date: new Date().toISOString().slice(0, 10) });
                  toast.success("Agence en service");
                }}>
                  <Check className="h-4 w-4 mr-2" /> Confirmer le démarrage
                </Button>
                {role !== "agent" && <p className="text-xs text-muted-foreground">Réservé à l'Agent.</p>}
              </>
            )}
            {s.state === "live" && (
              <div className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
                <div className="font-semibold">Agence en service</div>
                <div className="mt-1">Démarrée le {s.start_date}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}