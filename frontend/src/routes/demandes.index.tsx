import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DemandeBadge } from "@/components/StateBadge";
import { demandeStateLabel, categoryLabel, type Demande, type DemandeState } from "@/lib/ouvertures-store";
import api from "@/lib/api";
import { Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/demandes/")({
  head: () => ({ meta: [{ title: "Demandes d'ouverture — Cash Plus" }] }),
  component: DemandesList,
});

const filters: (DemandeState | "all")[] = ["all", "DATA_COLLECTION", "SUBMITTED", "VALIDATED", "REJECTED"];

function DemandesList() {
  const [state, setState] = useState<DemandeState | "all">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Demande[]>([]);
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
      const { data } = await api.get(`/demandes?${params.toString()}`);
      setRows(data.content);
      setTotalPages(data.total_pages);
      setTotalElements(data.total_elements);
    } finally {
      setLoading(false);
    }
  }, [page, state]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setPage(0); }, [state]);

  const filtered = useMemo(() => rows.filter((d) =>
    q === "" || `${d.reference} ${d.owner_name} ${d.city ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  ), [rows, q]);

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
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">Liste des demandes</span>
          <Button variant="ghost" size="sm" onClick={() => loadData()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        </div>
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
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{d.reference}</td>
                <td className="px-4 py-3 font-medium">{d.owner_name}</td>
                <td className="px-4 py-3">{d.city ?? "—"}</td>
                <td className="px-4 py-3">{d.agency_category ? categoryLabel[d.agency_category] : "—"}</td>
                <td className="px-4 py-3">
                  <span className={d.photo_count >= 5 ? "text-emerald-700" : "text-amber-700"}>
                    {d.photo_count} / 5
                  </span>
                </td>
                <td className="px-4 py-3"><DemandeBadge state={d.state} /></td>
                <td className="px-4 py-3 text-right">
                  <Link to="/demandes/$id" params={{ id: d.id }} className="text-primary text-sm hover:underline">Ouvrir</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucune demande.</td></tr>
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
    </AppLayout>
  );
}
