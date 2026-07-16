import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SuiviBadge } from "@/components/StateBadge";
import { useStore, suiviSteps, suiviStateLabel } from "@/lib/ouvertures-store";
import { useAuthStore } from "@/lib/auth-store";
import { useSuivis } from "@/lib/use-store";
import { suiviPhotoUrl, agencyThumb } from "@/lib/photos";
import { toast } from "sonner";
import { PhotoImg } from "@/components/PhotoImg";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { ArrowLeft, ArrowRight, Camera, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/suivis/$id")({
  head: () => ({ meta: [{ title: "Fiche suivi — Cash Plus" }] }),
  component: SuiviDetail,
});

function SuiviDetail() {
  const { id } = Route.useParams();
  const suivis = useSuivis();
  const s = suivis.find((x) => x.id === Number(id));
  const role = useAuthStore((s) => s.role);
  const fileRef = useRef<HTMLInputElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    useStore.loadSuivis();
  }, []);

  if (!s) {
    return (
      <AppLayout title="Suivi introuvable">
        <Link to="/suivis" className="text-primary">Retour</Link>
      </AppLayout>
    );
  }

  const currentIdx = suiviSteps.indexOf(s.state);

  return (
    <>
    <AppLayout title={s.agency_name ?? "Agence"} subtitle={`${s.reference} - ${s.city ?? ""}`}>
      <div className="mb-6 overflow-hidden rounded-lg border">
        <img src={agencyThumb(s.id)} alt={s.agency_name ?? ""} width={1600} height={400} className="w-full h-40 md:h-56 object-cover" />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/suivis" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <SuiviBadge state={s.state} />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center">
            {suiviSteps.map((step, i) => {
              const done = i < currentIdx || s.state === "LIVE";
              const active = i === currentIdx && s.state !== "LIVE";
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
            <CardHeader><CardTitle className="text-base">Preparation et documents</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ToggleRow label="Documents legaux prets" hint="Bail, CIN, registre de commerce, attestation bancaire..." checked={s.legal_documents_ready} disabled={role === "AGENT"} onChange={(v) => useStore.updateSuivi(s.id, { legal_documents_ready: v })} />
              <ToggleRow label="Local amenage / pret" checked={s.fit_out_ready} disabled={role === "AGENT"} onChange={(v) => useStore.updateSuivi(s.id, { fit_out_ready: v })} />
              <ToggleRow label="Reseau et code agence configures" checked={s.network_setup_ready} disabled={role === "AGENT"} onChange={(v) => useStore.updateSuivi(s.id, { network_setup_ready: v })} />
              <ToggleRow label="Conformite verifiee par le manager" checked={s.compliance_checked} disabled={role === "AGENT"} onChange={(v) => useStore.updateSuivi(s.id, { compliance_checked: v })} />
              <ToggleRow label="Installation sur site terminee" checked={s.installation_done} disabled={role === "AGENT"} onChange={(v) => useStore.updateSuivi(s.id, { installation_done: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Photos d'amenagement ({s.photos.length})</CardTitle>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await useStore.uploadSuiviPhoto(s.id, file);
                    toast("Photo ajoutee");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                />
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {s.photos.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                  <Camera className="h-6 w-6 mx-auto mb-2" />
                  Au moins 1 photo requise avant de terminer la codification.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {s.photos.map((photo, i) => (
                    <div key={photo.id} className="aspect-square rounded-md overflow-hidden border bg-muted">
                      <PhotoImg src={suiviPhotoUrl(s.id, photo)} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" onClick={() => setLightboxSrc(suiviPhotoUrl(s.id, photo))} />
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
            {s.state === "PREPARATION" && (
              <>
                <p className="text-sm text-muted-foreground">Etape : preparation des documents.</p>
                <Button className="w-full" disabled={role !== "MANAGER" || !s.legal_documents_ready} onClick={async () => {
                  await useStore.finishPreparation(s.id);
                  toast.success("Preparation terminee");
                }}>
                  <ArrowRight className="h-4 w-4 mr-2" /> Terminer la preparation
                </Button>
                {role !== "MANAGER" && <p className="text-xs text-muted-foreground">Reserve au Manager.</p>}
              </>
            )}
            {s.state === "CODIFICATION" && (
              <>
                <p className="text-sm text-muted-foreground">Etape : codification (amenagement + reseau).</p>
                <Button className="w-full" disabled={role !== "VALIDATEUR" || !s.fit_out_ready || s.photos.length < 1 || !s.network_setup_ready} onClick={async () => {
                  await useStore.finishCodification(s.id);
                  toast.success("Codification terminee");
                }}>
                  <ArrowRight className="h-4 w-4 mr-2" /> Terminer la codification
                </Button>
                {role !== "VALIDATEUR" && <p className="text-xs text-muted-foreground">Reserve au Validateur.</p>}
              </>
            )}
            {s.state === "CONTROL" && (
              <>
                <p className="text-sm text-muted-foreground">Etape : controle de conformite.</p>
                <Button className="w-full" disabled={role !== "MANAGER" || !s.compliance_checked} onClick={async () => {
                  await useStore.startInstallation(s.id);
                  toast.success("Installation lancee");
                }}>
                  <ArrowRight className="h-4 w-4 mr-2" /> Lancer l'installation
                </Button>
                {role !== "MANAGER" && <p className="text-xs text-muted-foreground">Reserve au Manager.</p>}
              </>
            )}
            {s.state === "INSTALLATION" && (
              <>
                <p className="text-sm text-muted-foreground">Etape : installation sur site.</p>
                <Button className="w-full" disabled={role !== "MANAGER" || !s.installation_done} onClick={async () => {
                  await useStore.confirmLive(s.id);
                  toast.success("Agence en service");
                }}>
                  <Check className="h-4 w-4 mr-2" /> Confirmer le demarrage
                </Button>
                {role !== "MANAGER" && <p className="text-xs text-muted-foreground">Reserve au Manager.</p>}
              </>
            )}
            {s.state === "LIVE" && (
              <div className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
                <div className="font-semibold">Agence en service</div>
                <div className="mt-1">Demarree le {s.start_date ?? "-"}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
    <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
  );
}

function ToggleRow({ label, hint, checked, disabled, onChange }: { label: string; hint?: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}
