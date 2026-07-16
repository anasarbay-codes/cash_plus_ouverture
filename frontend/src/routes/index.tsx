import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore, prospectionStateLabel, type ProspectionState } from "@/lib/ouvertures-store";
import { useAuthStore } from "@/lib/auth-store";
import { useProspections, useDemandes, useSuivis } from "@/lib/use-store";
import { heroBanner } from "@/lib/photos";
import { ArrowRight, Users, FileText, Rocket, CheckCircle2, Circle, ThumbsUp, XCircle, CheckCheck } from "lucide-react";

const stateMeta: Record<ProspectionState, { icon: typeof Circle; color: string }> = {
  NEW: { icon: Circle, color: "text-blue-600" },
  INTERESTED: { icon: ThumbsUp, color: "text-amber-600" },
  CONFIRMED: { icon: CheckCheck, color: "text-emerald-600" },
  NOT_INTERESTED: { icon: XCircle, color: "text-muted-foreground" },
};

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const prospections = useProspections();
  const demandes = useDemandes();
  const suivis = useSuivis();
  const role = useAuthStore((s) => s.role);
  const name = useAuthStore((s) => s.name);

  useEffect(() => {
    useStore.loadAll();
  }, []);

  const displayedProspections = role === "AGENT" && name
    ? prospections.filter((p) => p.assigned_agent_name === name)
    : prospections;

  const allStats = [
    {
      to: "/prospections",
      label: "Prospection",
      icon: Users,
      total: displayedProspections.length,
      hint: `${displayedProspections.filter((p) => p.state === "INTERESTED").length} intéressés`,
      roles: ["AGENT", "VALIDATEUR", "MANAGER"],
    },
    {
      to: "/demandes",
      label: "Demandes d'ouverture",
      icon: FileText,
      total: demandes.length,
      hint: `${demandes.filter((d) => d.state === "SUBMITTED").length} à valider`,
      roles: ["VALIDATEUR", "MANAGER"],
    },
    {
      to: "/suivis",
      label: "Suivi d'ouverture",
      icon: Rocket,
      total: suivis.length,
      hint: `${suivis.filter((s) => s.state !== "LIVE").length} en cours`,
      roles: ["VALIDATEUR", "MANAGER"],
    },
    {
      to: "/suivis",
      label: "Agences en service",
      icon: CheckCircle2,
      total: suivis.filter((s) => s.state === "LIVE").length,
      hint: "démarrées",
      roles: ["MANAGER"],
    },
  ];

  const stats = allStats.filter((s) => s.roles.includes(role ?? "MANAGER"));

  const pipeline = demandes.filter((d) => d.state === "SUBMITTED").slice(0, 5);

  return (
    <AppLayout title="Tableau de bord" subtitle="Vue d'ensemble du cycle d'ouverture des agences Cash Plus">
      <div className="relative mb-8 overflow-hidden rounded-lg border">
        <img src={heroBanner} alt="Cash Plus" width={1600} height={512} className="w-full h-40 md:h-48 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/90 via-sidebar/60 to-transparent flex items-center px-6 md:px-10">
          <div className="text-sidebar-foreground max-w-xl">
            <div className="text-xs uppercase tracking-widest text-sidebar-foreground/70">Cash Plus · Réseau</div>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold">Piloter l'ouverture des agences</h2>
            <p className="mt-2 text-sm text-sidebar-foreground/80">De la prospection à la mise en service, un processus unique et traçable.</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to} className="group">
              <Card className="hover:border-primary/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">{s.label}</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight">{s.total}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
                    </div>
                    <div className="rounded-md bg-secondary p-2 text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mb-8">
        {(["NEW", "INTERESTED", "CONFIRMED", "NOT_INTERESTED"] as ProspectionState[]).map((st) => {
          const count = displayedProspections.filter((p) => p.state === st).length;
          const meta = stateMeta[st];
          const Icon = meta.icon;
          return (
            <Link key={st} to="/prospections" className="group">
              <Card className="hover:border-primary/40 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className={`h-8 w-8 shrink-0 ${meta.color}`} />
                  <div className="min-w-0">
                    <div className="text-lg font-semibold tracking-tight">{count}</div>
                    <div className="text-xs text-muted-foreground truncate">{prospectionStateLabel[st]}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {role !== "AGENT" && (
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Demandes à valider</CardTitle>
              <Link to="/demandes" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {pipeline.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Aucune demande en attente de validation.</p>
              ) : (
                <ul className="divide-y">
                  {pipeline.map((d) => (
                    <li key={d.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{d.reference} — {d.owner_name}</div>
                        <div className="text-xs text-muted-foreground">{d.city} · soumise le {d.submitted_date ?? "—"}</div>
                      </div>
                      <Link
                        to="/demandes/$id"
                        params={{ id: d.id }}
                        className="text-sm text-primary hover:underline"
                      >
                        Ouvrir
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Étapes du processus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <div className="font-medium">1. Prospection</div>
                <div className="text-muted-foreground text-xs">Premier contact commercial</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <div className="font-medium">2. Demande d'ouverture</div>
                <div className="text-muted-foreground text-xs">Dossier détaillé + validation</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-accent" />
              <div>
                <div className="font-medium">3. Suivi d'ouverture</div>
                <div className="text-muted-foreground text-xs">Papiers, installation, mise en service</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
