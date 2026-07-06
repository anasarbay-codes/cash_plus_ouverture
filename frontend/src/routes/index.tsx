import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/ouvertures-store";
import { heroBanner } from "@/lib/photos";
import { ArrowRight, Users, FileText, Rocket, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const prospections = useStore((s) => s.prospections);
  const demandes = useStore((s) => s.demandes);
  const suivis = useStore((s) => s.suivis);

  const stats = [
    {
      to: "/prospections",
      label: "Prospection",
      icon: Users,
      total: prospections.length,
      hint: `${prospections.filter((p) => p.state === "interested").length} intéressés`,
    },
    {
      to: "/demandes",
      label: "Demandes d'ouverture",
      icon: FileText,
      total: demandes.length,
      hint: `${demandes.filter((d) => d.state === "submitted").length} à valider`,
    },
    {
      to: "/suivis",
      label: "Suivi d'ouverture",
      icon: Rocket,
      total: suivis.length,
      hint: `${suivis.filter((s) => s.state !== "live").length} en cours`,
    },
    {
      to: "/suivis",
      label: "Agences en service",
      icon: CheckCircle2,
      total: suivis.filter((s) => s.state === "live").length,
      hint: "démarrées",
    },
  ];

  const pipeline = demandes.filter((d) => d.state === "submitted").slice(0, 5);

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

      <div className="grid gap-6 lg:grid-cols-3">
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
                      <div className="text-xs text-muted-foreground">{d.city} · soumise le {d.submitted_date}</div>
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
