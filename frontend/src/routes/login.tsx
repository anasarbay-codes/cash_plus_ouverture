import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Lock, User, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/ouvertures-store";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import heroBanner from "@/assets/hero-banner.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — Cash Plus Gestion des Ouvertures" },
      { name: "description", content: "Accès sécurisé à la plateforme Cash Plus de gestion des ouvertures d'agences." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const authed = useAuthStore((s) => s.authed);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authed) navigate({ to: "/" });
  }, [authed, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await useStore.login(email.trim().toLowerCase(), password);
      toast.success(`Bienvenue, ${data.name}`);
      navigate({ to: "/" });
    } catch {
      toast.error("Identifiants incorrects", { description: "Vérifiez votre email et mot de passe." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:block relative overflow-hidden bg-sidebar">
        <img
          src={heroBanner}
          alt="Réseau d'agences Cash Plus"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar/90 via-sidebar/70 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12 text-sidebar-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">Cash Plus</div>
              <div className="text-xs text-sidebar-foreground/70">Gestion des Ouvertures</div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-semibold leading-tight max-w-md">
              Pilotez l'ouverture de vos agences, de la prospection au démarrage.
            </h2>
            <p className="mt-4 text-sm text-sidebar-foreground/80 max-w-md">
              Une plateforme unifiée pour les agents commerciaux, les validateurs et les managers réseau.
            </p>
          </div>
          <div className="text-xs text-sidebar-foreground/60">
            © {new Date().getFullYear()} Cash Plus — Tous droits réservés
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Cash Plus</div>
              <div className="text-xs text-muted-foreground">Gestion des Ouvertures</div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Connexion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accédez à votre espace de gestion des ouvertures.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="prenom.nom@cashplus.ma"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => toast.info("Contactez votre administrateur pour réinitialiser votre mot de passe.")}
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : (<>Se connecter <ArrowRight className="h-4 w-4" /></>)}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
