import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, type LeadSource } from "@/lib/ouvertures-store";
import { useAuthStore } from "@/lib/auth-store";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/creation_prospection")({
  head: () => ({ meta: [{ title: "Nouvelle Prospection — Cash Plus" }] }),
  component: CreationProspection,
});

function CreationProspection() {
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();

  const [owner_name, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [lead_source, setLeadSource] = useState<LeadSource>("WALK_IN");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [national_id, setNationalId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (role !== "AGENT") {
    return (
      <AppLayout title="Acces refuse">
        <p className="text-muted-foreground">Seul un agent commercial peut creer une nouvelle prospection.</p>
      </AppLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await useStore.createProspection({
        owner_name,
        phone,
        lead_source,
        city,
        address: address || undefined,
        national_id: national_id || undefined,
        notes,
      });
      toast.success("Prospection creee");
      navigate({ to: "/prospections" });
    } catch {
      toast.error("Erreur lors de la creation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Nouvelle Prospection" subtitle="Ajouter un nouveau prospect">
      <div className="max-w-2xl bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Nom du proprietaire <span className="text-destructive">*</span></label>
              <Input required value={owner_name} onChange={(e) => setOwnerName(e.target.value)} placeholder="Jean Dupont" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Telephone <span className="text-destructive">*</span></label>
              <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06..." type="tel" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Ville <span className="text-destructive">*</span></label>
              <Input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Casablanca" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Adresse</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 Rue de la Liberté" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">N° CIN</label>
              <Input value={national_id} onChange={(e) => setNationalId(e.target.value)} placeholder="AB123456" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Source</label>
              <Select value={lead_source} onValueChange={(v) => setLeadSource(v as LeadSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WALK_IN">Visite</SelectItem>
                  <SelectItem value="WEBSITE">Site web</SelectItem>
                  <SelectItem value="FACEBOOK">Facebook</SelectItem>
                  <SelectItem value="PHONE">Telephone</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Notes</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Details supplementaires..." />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creation..." : "Creer la prospection"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
