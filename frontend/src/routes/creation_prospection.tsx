import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, type LeadSource } from "@/lib/ouvertures-store";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/creation_prospection")({
  head: () => ({ meta: [{ title: "Nouvelle Prospection — Cash Plus" }] }),
  component: CreationProspection,
});

function CreationProspection() {
  const addProspection = useStore((s) => s.addProspection);
  const currentUser = useStore((s) => s.currentUser);
  const role = useStore((s) => s.role);
  const navigate = useNavigate();

  const [owner_name, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [lead_source, setLeadSource] = useState<LeadSource>("walk_in");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  if (role !== "agent") {
    return (
      <AppLayout title="Accès refusé">
        <p className="text-muted-foreground">Seul un agent commercial peut créer une nouvelle prospection.</p>
      </AppLayout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    addProspection({
      owner_name,
      phone,
      lead_source,
      city,
      notes,
      assigned_agent: currentUser,
    });
    
    navigate({ to: "/prospections" });
  };

  return (
    <AppLayout title="Nouvelle Prospection" subtitle="Ajouter un nouveau prospect">
      <div className="max-w-2xl bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Nom du propriétaire <span className="text-destructive">*</span></label>
              <Input required value={owner_name} onChange={(e) => setOwnerName(e.target.value)} placeholder="Jean Dupont" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Téléphone <span className="text-destructive">*</span></label>
              <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06..." type="tel" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Ville <span className="text-destructive">*</span></label>
              <Input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Casablanca" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Source</label>
              <Select value={lead_source} onValueChange={(v) => setLeadSource(v as LeadSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk_in">Visite</SelectItem>
                  <SelectItem value="website">Site web</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="phone">Téléphone</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Notes</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Détails supplémentaires..." />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Annuler
              </Button>
              <Button type="submit">
                Créer la prospection
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
