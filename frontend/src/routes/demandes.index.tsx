import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DemandeBadge } from "@/components/StateBadge";
import { useStore, demandeStateLabel, categoryLabel, type DemandeState } from "@/lib/ouvertures-store";
import { Search } from "lucide-react";

export const Route = createFileRoute("/demandes/")({
  head: () => ({ meta: [{ title: "Demandes d'ouverture — Cash Plus" }] }),
  component: DemandesList,
});

const filters: (DemandeState | "all")[] = ["all", "data_collection", "submitted", "validated", "rejected"];

function DemandesList() {
  const demandes = useStore((s) => s.demandes);
  const [state, setState] = useState<DemandeState | "all">("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => demandes.filter((d) =>
    (state === "all" || d.state === state) &&
    (q === "" || `${d.reference} ${d.owner_name} ${d.city ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  ), [demandes, state, q]);

  return (
    <AppLayout title="Demandes d'ouverture" subtitle="Dossiers détaillés en attente de validation">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (référence, propriétaire, ville)..." className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map((f) => (
            <Button key={f} variant={state === f ? "default" : "outline"} size="sm" onClick={() => setState(f)}>
              {f === "all" ? "Toutes" : demandeStateLabel[f]}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Référence</th>
              <th className="px-4 py-3 font-medium">Propriétaire</th>
              <th className="px-4 py-3 font-medium">Ville</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Photos</th>
              <th className="px-4 py-3 font-medium">État</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{d.reference}</td>
                <td className="px-4 py-3 font-medium">{d.owner_name}</td>
                <td className="px-4 py-3">{d.city ?? "—"}</td>
                <td className="px-4 py-3">{categoryLabel[d.agency_category]}</td>
                <td className="px-4 py-3">
                  <span className={d.photos.length >= 5 ? "text-emerald-700" : "text-amber-700"}>
                    {d.photos.length} / 5
                  </span>
                </td>
                <td className="px-4 py-3"><DemandeBadge state={d.state} /></td>
                <td className="px-4 py-3 text-right">
                  <Link to="/demandes/$id" params={{ id: d.id }} className="text-primary text-sm hover:underline">Ouvrir</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucune demande.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </AppLayout>
  );
}