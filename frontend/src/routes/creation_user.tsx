import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, type Role } from "@/lib/ouvertures-store";
import { useAuthStore } from "@/lib/auth-store";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/creation_user")({
  head: () => ({ meta: [{ title: "Nouvel Utilisateur — Cash Plus" }] }),
  component: CreationUser,
});

function CreationUser() {
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<Role>("AGENT");
  const [loading, setLoading] = useState(false);

  if (role !== "MANAGER") {
    return (
      <AppLayout title="Accès refusé">
        <p className="text-muted-foreground">Seul un manager peut créer un utilisateur.</p>
      </AppLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await useStore.createUser({ name, email, password, role: userRole });
      toast.success("Utilisateur créé");
      navigate({ to: "/users" });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Erreur lors de la création";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Nouvel Utilisateur" subtitle="Ajouter un nouveau compte utilisateur">
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
              <label className="text-sm font-medium leading-none text-foreground">Mot de passe <span className="text-destructive">*</span></label>
              <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
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
                {loading ? "Création..." : "Créer l'utilisateur"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
