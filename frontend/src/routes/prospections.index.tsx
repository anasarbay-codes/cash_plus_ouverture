import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProspectionBadge } from "@/components/StateBadge";
import { useStore, leadSourceLabel, prospectionStateLabel, type ProspectionState } from "@/lib/ouvertures-store";
import { Search } from "lucide-react";

export const Route = createFileRoute("/prospections/")({
  head: () => ({ meta: [{ title: "Prospection — Cash Plus" }] }),
  component: ProspectionsList,
});

const filters: (ProspectionState | "all")[] = ["all", "new", "interested", "confirmed", "not_interested"];

function ProspectionsList() {
  const prospections = useStore((s) => s.prospections);
  const [state, setState] = useState<ProspectionState | "all">("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => prospections.filter((p) =>
    (state === "all" || p.state === state) &&
    (q === "" || `${p.owner_name} ${p.phone} ${p.city ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  ), [prospections, state, q]);

  return (
    <AppLayout title="Prospection" subtitle="Prospects contactés par les agents commerciaux">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un prospect..." className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map((f) => (
            <Button key={f} variant={state === f ? "default" : "outline"} size="sm" onClick={() => setState(f)}>
              {f === "all" ? "Tous" : prospectionStateLabel[f]}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Propriétaire</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">Ville</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">État</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{p.owner_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                <td className="px-4 py-3">{p.city ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{leadSourceLabel[p.lead_source]}</td>
                <td className="px-4 py-3">{p.assigned_agent}</td>
                <td className="px-4 py-3"><ProspectionBadge state={p.state} /></td>
                <td className="px-4 py-3 text-right">
                  <Link to="/prospections/$id" params={{ id: p.id }} className="text-primary text-sm hover:underline">Ouvrir</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucun prospect ne correspond aux filtres.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </AppLayout>
  );
}