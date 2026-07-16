import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SuiviBadge } from "@/components/StateBadge";
import { suiviStateLabel, type Suivi, type SuiviState } from "@/lib/ouvertures-store";
import api from "@/lib/api";
import { agencyThumb } from "@/lib/photos";
import { Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/suivis/")({
  head: () => ({ meta: [{ title: "Suivi d'ouverture — Cash Plus" }] }),
  component: SuivisList,
});

const filters: (SuiviState | "all")[] = ["all", "PREPARATION", "CODIFICATION", "CONTROL", "INSTALLATION", "LIVE"];

function SuivisList() {
  const [state, setState] = useState<SuiviState | "all">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Suivi[]>([]);
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
      const { data } = await api.get(`/suivis?${params.toString()}`);
      setRows(data.content);
      setTotalPages(data.total_pages);
      setTotalElements(data.total_elements);
    } finally {
      setLoading(false);
    }
  }, [page, state]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setPage(0); }, [state]);

  const filtered = useMemo(() => rows.filter((s) =>
    q === "" || `${s.reference} ${s.agency_name ?? ""} ${s.city ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  ), [rows, q]);

  return (
    <AppLayout title="Suivi d'ouverture" subtitle="Papiers, installation et mise en service des agences">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (référence, agence, ville)..." className="pl-9" />
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
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">Liste des suivis</span>
          <Button variant="ghost" size="sm" onClick={() => loadData()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Agence</th>
              <th className="px-4 py-3 font-medium">Ville</th>
              <th className="px-4 py-3 font-medium">Etat</th>
              <th className="px-4 py-3 font-medium">Demarrage</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{s.reference}</td>
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-3">
                    <img src={agencyThumb(s.id)} alt="" width={40} height={40} className="h-10 w-10 rounded-md object-cover border" loading="lazy" />
                    <span>{s.agency_name ?? "-"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{s.city ?? "-"}</td>
                <td className="px-4 py-3"><SuiviBadge state={s.state} /></td>
                <td className="px-4 py-3 text-muted-foreground">{s.start_date ?? "-"}</td>
                <td className="px-4 py-3 text-right">
                  <Link to="/suivis/$id" params={{ id: s.id }} className="text-primary text-sm hover:underline">Ouvrir</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun suivi.</td></tr>
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
