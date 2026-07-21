import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, type Role } from "@/lib/ouvertures-store";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export const Route = createFileRoute("/users/$id")({
  head: () => ({ meta: [{ title: "Modifier Utilisateur — Cash Plus" }] }),
  component: UserEdit,
});

function UserEdit() {
  const { id } = Route.useParams();
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<Role>("AGENT");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/admin/users");
        const user = data.find((u: any) => u.id === Number(id));
        if (user) {
          setName(user.name);
          setEmail(user.email);
          setUserRole(user.role);
        }
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  if (role !== "MANAGER") {
    return (
      <AppLayout title="Accès refusé">
        <p className="text-muted-foreground">Seul un manager peut modifier un utilisateur.</p>
      </AppLayout>
    );
  }

  if (fetching) {
    return (
      <AppLayout title="Chargement...">
        <p className="text-muted-foreground">Chargement de l'utilisateur...</p>
      </AppLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await useStore.updateUser(Number(id), {
        name,
        email,
        password: password || undefined,
        role: userRole,
      });
      toast.success("Utilisateur mis à jour");
      navigate({ to: "/users" });
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Modifier l'utilisateur" subtitle={name}>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/users" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour à la liste
        </Link>
      </div>

      <div className="max-w-2xl bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Nom <span className="text-destructive">*</span></label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Email <span className="text-destructive">*</span></label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Nouveau mot de passe</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Laisser vide pour ne pas changer" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Rôle</label>
              <Select value={userRole} onValueChange={(v) => setUserRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENT">Agent</SelectItem>
                  <SelectItem value="VALIDATEUR">Validateur</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
