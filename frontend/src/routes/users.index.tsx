import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { useUsers } from "@/lib/use-store";
import { useStore } from "@/lib/ouvertures-store";
import api from "@/lib/api";
import { Search, Plus, RefreshCw, Edit3 } from "lucide-react";

export const Route = createFileRoute("/users/")({
  head: () => ({ meta: [{ title: "Utilisateurs — Cash Plus" }] }),
  component: UsersList,
});

function UsersList() {
  const role = useAuthStore((s) => s.role);
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<{ id: number; name: string; email: string; role: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => users.filter((u) =>
    q === "" || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase()),
  ), [users, q]);

  if (role !== "MANAGER") {
    return (
      <AppLayout title="Accès refusé">
        <p className="text-muted-foreground">Seul un manager peut gérer les utilisateurs.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Utilisateurs" subtitle="Gestion des comptes utilisateurs">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un utilisateur..." className="pl-9" />
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">Liste des utilisateurs</span>
          <Button variant="ghost" size="sm" onClick={() => loadData()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize">
                    {u.role.toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to="/users/$id" params={{ id: u.id }} className="inline-flex items-center gap-1 text-primary text-sm hover:underline">
                    <Edit3 className="h-3 w-3" /> Modifier
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Aucun utilisateur trouvé.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="fixed bottom-8 right-8 z-50">
        <Link to="/creation_user">
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </AppLayout>
  );
}
