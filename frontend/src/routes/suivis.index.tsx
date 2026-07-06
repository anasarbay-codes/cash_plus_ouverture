import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SuiviBadge } from "@/components/StateBadge";
import { useStore, suiviStateLabel, categoryLabel, type SuiviState } from "@/lib/ouvertures-store";
import { agencyThumb } from "@/lib/photos";
import { Search } from "lucide-react";

export const Route = createFileRoute("/suivis/")({
  head: () => ({ meta: [{ title: "Suivi d'ouverture — Cash Plus" }] }),
  component: SuivisList,
});

const filters: (SuiviState | "all")[] = ["all", "preparation", "codification", "control", "installation", "live"];

function SuivisList() {
  const suivis = useStore((s) => s.suivis);
  const [state, setState] = useState<SuiviState | "all">("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => suivis.filter((s) =>
    (state === "all" || s.state === state) &&
    (q === "" || `${s.reference} ${s.agency_name} ${s.city ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  ), [suivis, state, q]);

  return (
    <AppLayout title="Suivi d'ouverture" subtitle="Papiers, installation et mise en service des agences">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map((f) => (
            <Button key={f} variant={state === f ? "default" : "outline"} size="sm" onClick={() => setState(f)}>
              {f === "all" ? "Tous" : suiviStateLabel[f]}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Référence</th>
              <th className="px-4 py-3 font-medium">Agence</th>
              <th className="px-4 py-3 font-medium">Ville</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">État</th>
              <th className="px-4 py-3 font-medium">Démarrage</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{s.reference}</td>
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-3">
                    <img src={agencyThumb(s.id)} alt="" width={40} height={40} className="h-10 w-10 rounded-md object-cover border" loading="lazy" />
                    <span>{s.agency_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{s.city ?? "—"}</td>
                <td className="px-4 py-3">{categoryLabel[s.agency_category]}</td>
                <td className="px-4 py-3"><SuiviBadge state={s.state} /></td>
                <td className="px-4 py-3 text-muted-foreground">{s.start_date ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link to="/suivis/$id" params={{ id: s.id }} className="text-primary text-sm hover:underline">Ouvrir</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucun suivi.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </AppLayout>
  );
}