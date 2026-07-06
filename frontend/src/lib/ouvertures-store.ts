import { create } from "zustand";

export type Role = "agent" | "validateur" | "manager";

export type ProspectionState = "new" | "interested" | "not_interested" | "confirmed";
export type DemandeState = "data_collection" | "submitted" | "validated" | "rejected";
export type SuiviState = "preparation" | "codification" | "control" | "installation" | "live";

export type LeadSource = "walk_in" | "website" | "facebook" | "phone" | "other";
export type AgencyCategory = "standard" | "hot_spot" | "rural";

export interface Prospection {
  id: string;
  owner_name: string;
  phone: string;
  lead_source: LeadSource;
  assigned_agent: string;
  national_id?: string;
  address?: string;
  city?: string;
  notes?: string;
  state: ProspectionState;
  rejection_reason?: string;
  created_at: string;
}

export interface Demande {
  id: string;
  reference: string;
  request_date: string;
  submitted_date?: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  address?: string;
  city?: string;
  area_sqm?: number;
  agency_category: AgencyCategory;
  photos: string[];
  state: DemandeState;
  rejection_reason?: string;
}

export interface Suivi {
  id: string;
  reference: string;
  agency_name: string;
  address?: string;
  city?: string;
  agency_category: AgencyCategory;
  legal_documents_ready: boolean;
  fit_out_ready: boolean;
  fit_out_photos: string[];
  network_setup_ready: boolean;
  compliance_checked: boolean;
  installation_done: boolean;
  start_date?: string;
  state: SuiviState;
}

let refCounter = 4;
const nextRef = () => `DO-${String(++refCounter).padStart(5, "0")}`;

interface Store {
  role: Role;
  setRole: (r: Role) => void;
  authed: boolean;
  currentUser: string | null;
  login: (user: string) => void;
  logout: () => void;
  prospections: Prospection[];
  demandes: Demande[];
  suivis: Suivi[];
  updateProspection: (id: string, patch: Partial<Prospection>) => void;
  confirmProspection: (id: string) => string; // returns demande id
  updateDemande: (id: string, patch: Partial<Demande>) => void;
  validateDemande: (id: string) => string; // returns suivi id
  updateSuivi: (id: string, patch: Partial<Suivi>) => void;
}

export const useStore = create<Store>((set, get) => ({
  role: "manager",
  setRole: (role) => set({ role }),
  authed: false,
  currentUser: null,
  login: (currentUser) => set({ authed: true, currentUser }),
  logout: () => set({ authed: false, currentUser: null }),
  prospections: [
    { id: "p1", owner_name: "Youssef El Amrani", phone: "0612345678", lead_source: "walk_in", assigned_agent: "Karim B.", city: "Casablanca", address: "Rue Ibn Sina", state: "new", created_at: "2025-06-18" },
    { id: "p2", owner_name: "Fatima Zahra", phone: "0698765432", lead_source: "facebook", assigned_agent: "Karim B.", city: "Rabat", state: "interested", notes: "Local déjà loué", created_at: "2025-06-20" },
    { id: "p3", owner_name: "Ahmed Ouazzani", phone: "0655544433", lead_source: "phone", assigned_agent: "Salma R.", city: "Marrakech", state: "confirmed", created_at: "2025-06-22" },
    { id: "p4", owner_name: "Nadia Chraibi", phone: "0611223344", lead_source: "website", assigned_agent: "Karim B.", city: "Tanger", state: "not_interested", rejection_reason: "Emplacement non conforme", created_at: "2025-06-25" },
  ],
  demandes: [
    { id: "d1", reference: "DO-00001", request_date: "2025-06-22", owner_name: "Ahmed Ouazzani", owner_phone: "0655544433", owner_email: "ahmed@example.ma", city: "Marrakech", address: "Av. Mohammed V", area_sqm: 45, agency_category: "hot_spot", photos: ["a","b","c","d","e"], state: "submitted", submitted_date: "2025-06-26" },
    { id: "d2", reference: "DO-00002", request_date: "2025-06-15", owner_name: "Hassan Idrissi", owner_phone: "0677889900", city: "Fès", address: "Bd. Zerktouni", area_sqm: 30, agency_category: "standard", photos: ["a","b"], state: "data_collection" },
    { id: "d3", reference: "DO-00003", request_date: "2025-06-10", owner_name: "Meryem Alaoui", owner_phone: "0644332211", city: "Agadir", area_sqm: 60, agency_category: "rural", photos: ["a","b","c","d","e","f"], state: "validated", submitted_date: "2025-06-12" },
    { id: "d4", reference: "DO-00004", request_date: "2025-06-05", owner_name: "Rachid Bennani", owner_phone: "0699887766", city: "Oujda", area_sqm: 40, agency_category: "standard", photos: ["a","b","c","d","e"], state: "rejected", submitted_date: "2025-06-07", rejection_reason: "Zone déjà couverte par une agence proche" },
  ],
  suivis: [
    { id: "s1", reference: "DO-00003", agency_name: "Cash Plus Agadir Centre", city: "Agadir", agency_category: "rural", legal_documents_ready: true, fit_out_ready: false, fit_out_photos: [], network_setup_ready: false, compliance_checked: false, installation_done: false, state: "codification" },
    { id: "s2", reference: "DO-00000", agency_name: "Cash Plus Casa Maârif", city: "Casablanca", agency_category: "hot_spot", legal_documents_ready: true, fit_out_ready: true, fit_out_photos: ["a"], network_setup_ready: true, compliance_checked: true, installation_done: false, state: "installation" },
    { id: "s3", reference: "DO-99999", agency_name: "Cash Plus Rabat Agdal", city: "Rabat", agency_category: "standard", legal_documents_ready: true, fit_out_ready: true, fit_out_photos: ["a","b"], network_setup_ready: true, compliance_checked: true, installation_done: true, start_date: "2025-06-01", state: "live" },
  ],

  updateProspection: (id, patch) => set((s) => ({
    prospections: s.prospections.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  })),

  confirmProspection: (id) => {
    const p = get().prospections.find((x) => x.id === id);
    if (!p) return "";
    const newId = `d${Date.now()}`;
    const demande: Demande = {
      id: newId,
      reference: nextRef(),
      request_date: new Date().toISOString().slice(0, 10),
      owner_name: p.owner_name,
      owner_phone: p.phone,
      address: p.address,
      city: p.city,
      agency_category: "standard",
      photos: [],
      state: "data_collection",
    };
    set((s) => ({
      prospections: s.prospections.map((x) => (x.id === id ? { ...x, state: "confirmed" } : x)),
      demandes: [demande, ...s.demandes],
    }));
    return newId;
  },

  updateDemande: (id, patch) => set((s) => ({
    demandes: s.demandes.map((d) => (d.id === id ? { ...d, ...patch } : d)),
  })),

  validateDemande: (id) => {
    const d = get().demandes.find((x) => x.id === id);
    if (!d) return "";
    const newId = `s${Date.now()}`;
    const suivi: Suivi = {
      id: newId,
      reference: d.reference,
      agency_name: `Cash Plus ${d.city ?? ""}`.trim(),
      address: d.address,
      city: d.city,
      agency_category: d.agency_category,
      legal_documents_ready: false,
      fit_out_ready: false,
      fit_out_photos: [],
      network_setup_ready: false,
      compliance_checked: false,
      installation_done: false,
      state: "preparation",
    };
    set((s) => ({
      demandes: s.demandes.map((x) => (x.id === id ? { ...x, state: "validated" } : x)),
      suivis: [suivi, ...s.suivis],
    }));
    return newId;
  },

  updateSuivi: (id, patch) => set((s) => ({
    suivis: s.suivis.map((x) => (x.id === id ? { ...x, ...patch } : x)),
  })),
}));

export const prospectionStateLabel: Record<ProspectionState, string> = {
  new: "Nouveau",
  interested: "Intéressé",
  not_interested: "Non intéressé",
  confirmed: "Confirmé",
};
export const demandeStateLabel: Record<DemandeState, string> = {
  data_collection: "Collecte",
  submitted: "Soumise",
  validated: "Validée",
  rejected: "Refusée",
};
export const suiviStateLabel: Record<SuiviState, string> = {
  preparation: "Préparation",
  codification: "Codification",
  control: "Contrôle",
  installation: "Installation",
  live: "En service",
};
export const suiviSteps: SuiviState[] = ["preparation", "codification", "control", "installation", "live"];
export const leadSourceLabel: Record<LeadSource, string> = {
  walk_in: "Visite",
  website: "Site web",
  facebook: "Facebook",
  phone: "Téléphone",
  other: "Autre",
};
export const categoryLabel: Record<AgencyCategory, string> = {
  standard: "Standard",
  hot_spot: "Hot spot",
  rural: "Rural",
};