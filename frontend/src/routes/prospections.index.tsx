import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProspectionBadge } from "@/components/StateBadge";
import { leadSourceLabel, prospectionStateLabel, type Prospection, type ProspectionState } from "@/lib/ouvertures-store";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import { Search, Plus, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/prospections/")({
  head: () => ({ meta: [{ title: "Prospection — Cash Plus" }] }),
  component: ProspectionsList,
});

const filters: (ProspectionState | "all")[] = ["all", "NEW", "INTERESTED", "CONFIRMED", "NOT_INTERESTED"];

function ProspectionsList() {
  const role = useAuthStore((s) => s.role);
  const [state, setState] = useState<ProspectionState | "all">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Prospection[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(size));
      params.set("sort", "id,desc");
      if (state !== "all") params.set("state", state);
      const { data } = await api.get(`/prospections?${params.toString()}`);
      setRows(data.content);
      setTotalPages(data.total_pages);
      setTotalElements(data.total_elements);
    } finally {
      setLoading(false);
    }
  }, [page, state]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setPage(0); }, [state]);

  const filtered = useMemo(() => rows.filter((p) =>
    q === "" || `${p.owner_name} ${p.phone} ${p.city ?? ""} ${p.assigned_agent_name ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  ), [rows, q]);

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
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">Liste des prospections</span>
          <Button variant="ghost" size="sm" onClick={() => loadData()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        </div>
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
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{p.owner_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                <td className="px-4 py-3">{p.city ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{leadSourceLabel[p.lead_source]}</td>
                <td className="px-4 py-3">{p.assigned_agent_name}</td>
                <td className="px-4 py-3"><ProspectionBadge state={p.state} /></td>
                <td className="px-4 py-3 text-right">
                  <Link to="/prospections/$id" params={{ id: p.id }} className="text-primary text-sm hover:underline">Ouvrir</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucun prospect ne correspond aux filtres.</td></tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-muted-foreground">
            {totalElements} résultat{totalElements > 1 ? "s" : ""} — page {page + 1} / {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              Suivant <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {role === "AGENT" && (
        <div className="fixed bottom-8 right-8 z-50">
          <Link to="/creation_prospection">
            <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
