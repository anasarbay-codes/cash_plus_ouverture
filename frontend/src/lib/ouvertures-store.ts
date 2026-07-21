import api from "./api";
import { useAuthStore, type Role } from "./auth-store";

export type { Role };

export type ProspectionState = "NEW" | "INTERESTED" | "NOT_INTERESTED" | "CONFIRMED";
export type DemandeState = "DATA_COLLECTION" | "SUBMITTED" | "VALIDATED" | "REJECTED";
export type SuiviState = "PREPARATION" | "CODIFICATION" | "CONTROL" | "INSTALLATION" | "LIVE";

export type LeadSource = "WALK_IN" | "WEBSITE" | "FACEBOOK" | "PHONE" | "OTHER";
export type AgencyCategory = "STANDARD" | "HOT_SPOT" | "RURAL";

export interface Prospection {
  id: number;
  owner_name: string;
  phone: string;
  lead_source: LeadSource;
  assigned_agent_id: number;
  assigned_agent_name: string;
  national_id?: string;
  address?: string;
  city?: string;
  notes?: string;
  state: ProspectionState;
  rejection_reason?: string;
}

export interface Demande {
  id: number;
  reference: string;
  request_date: string;
  submitted_date?: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  address?: string;
  city?: string;
  area_sqm?: number;
  agency_category?: AgencyCategory;
  photos: Photo[];
  state: DemandeState;
  rejection_reason?: string;
  prospection_id?: number;
  assigned_agent_id: number;
  assigned_agent_name: string;
  photo_count: number;
}

export interface Photo {
  id: number;
  file_path: string;
  uploaded_at: string;
}

export interface Suivi {
  id: number;
  reference: string;
  agency_name?: string;
  address?: string;
  city?: string;
  legal_documents_ready: boolean;
  fit_out_ready: boolean;
  network_setup_ready: boolean;
  compliance_checked: boolean;
  installation_done: boolean;
  start_date?: string;
  state: SuiviState;
  demande_id?: number;
  assigned_agent_id: number;
  assigned_agent_name: string;
  photos: Photo[];
  photo_count: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

let _prospections: Prospection[] = [];
let _demandes: Demande[] = [];
let _suivis: Suivi[] = [];
let _users: User[] = [];
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  _listeners.push(l);
  return () => {
    _listeners = _listeners.filter((x) => x !== l);
  };
}

function getSnapshot() {
  return { prospections: _prospections, demandes: _demandes, suivis: _suivis, users: _users };
}

function emitChange() {
  notify();
}

export const useStore = {
  subscribe,
  getSnapshot,

  getState: () => getSnapshot(),

  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    useAuthStore.getState().login(data.token, data.name, data.email, data.role);
    return data;
  },

  logout: () => {
    useAuthStore.getState().logout();
  },

  setRole: (role: Role) => {
    useAuthStore.getState().setRole(role);
  },

  loadProspections: async () => {
    const { data } = await api.get<PageResponse<Prospection>>("/prospections?size=200");
    _prospections = data.content;
    emitChange();
  },

  loadDemandes: async () => {
    const { data } = await api.get<PageResponse<Demande>>("/demandes?size=200");
    _demandes = data.content;
    emitChange();
  },

  loadSuivis: async () => {
    const { data } = await api.get<PageResponse<Suivi>>("/suivis?size=200");
    _suivis = data.content;
    emitChange();
  },

  loadAll: async () => {
    const [p, d, s] = await Promise.all([
      api.get<PageResponse<Prospection>>("/prospections?size=200"),
      api.get<PageResponse<Demande>>("/demandes?size=200"),
      api.get<PageResponse<Suivi>>("/suivis?size=200"),
    ]);
    _prospections = p.data.content;
    _demandes = d.data.content;
    _suivis = s.data.content;
    emitChange();
  },

  createProspection: async (body: {
    owner_name: string;
    phone: string;
    lead_source: LeadSource;
    national_id?: string;
    address?: string;
    city?: string;
    notes?: string;
  }) => {
    const { data } = await api.post("/prospections", {
      owner_name: body.owner_name,
      phone: body.phone,
      lead_source: body.lead_source,
      national_id: body.national_id,
      address: body.address,
      city: body.city,
      notes: body.notes,
    });
    await useStore.loadProspections();
    return data;
  },

  updateProspection: async (id: number, patch: Partial<Prospection>) => {
    if (patch.state === "INTERESTED") {
      await api.patch(`/prospections/${id}/mark-interested`);
    } else if (patch.state === "NOT_INTERESTED") {
      await api.patch(`/prospections/${id}/mark-not-interested`, {
        rejectionReason: patch.rejection_reason || "Non précisé",
      });
    } else {
      await api.put(`/prospections/${id}`, {
        owner_name: patch.owner_name,
        phone: patch.phone,
        lead_source: patch.lead_source,
        national_id: patch.national_id,
        address: patch.address,
        city: patch.city,
        notes: patch.notes,
      });
    }
    await useStore.loadProspections();
  },

  confirmProspection: async (id: number) => {
    const { data } = await api.post(`/prospections/${id}/confirm`);
    await Promise.all([useStore.loadProspections(), useStore.loadDemandes()]);
    return String(data.id);
  },

  updateDemande: async (id: number, patch: Partial<Demande>) => {
    await api.put(`/demandes/${id}`, {
      owner_name: patch.owner_name,
      owner_phone: patch.owner_phone,
      owner_email: patch.owner_email,
      address: patch.address,
      city: patch.city,
      area_sqm: patch.area_sqm,
      agency_category: patch.agency_category,
    });
    await useStore.loadDemandes();
  },

  submitDemande: async (id: number) => {
    await api.patch(`/demandes/${id}/submit`);
    await useStore.loadDemandes();
  },

  validateDemande: async (id: number) => {
    await api.patch(`/demandes/${id}/validate`);
    await Promise.all([useStore.loadDemandes(), useStore.loadSuivis()]);
  },

  rejectDemande: async (id: number, reason: string) => {
    await api.patch(`/demandes/${id}/reject`, { rejectionReason: reason });
    await useStore.loadDemandes();
  },

  reopenDemande: async (id: number) => {
    await api.patch(`/demandes/${id}/reopen`);
    await useStore.loadDemandes();
  },

  uploadDemandePhoto: async (demandeId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    await api.postForm(`/demandes/${demandeId}/photos`, form);
    await useStore.loadDemandes();
  },

  deleteDemandePhoto: async (demandeId: number, photoId: number) => {
    await api.delete(`/demandes/${demandeId}/photos/${photoId}`);
    await useStore.loadDemandes();
  },

  updateSuivi: async (id: number, patch: Partial<Suivi>) => {
    await api.put(`/suivis/${id}`, {
      agency_name: patch.agency_name,
      address: patch.address,
      city: patch.city,
      legal_documents_ready: patch.legal_documents_ready,
      fit_out_ready: patch.fit_out_ready,
      network_setup_ready: patch.network_setup_ready,
      compliance_checked: patch.compliance_checked,
      installation_done: patch.installation_done,
    });
    await useStore.loadSuivis();
  },

  finishPreparation: async (id: number) => {
    await api.patch(`/suivis/${id}/finish-preparation`);
    await useStore.loadSuivis();
  },

  finishCodification: async (id: number) => {
    await api.patch(`/suivis/${id}/finish-codification`);
    await useStore.loadSuivis();
  },

  startInstallation: async (id: number) => {
    await api.patch(`/suivis/${id}/start-installation`);
    await useStore.loadSuivis();
  },

  confirmLive: async (id: number) => {
    await api.patch(`/suivis/${id}/confirm-live`);
    await useStore.loadSuivis();
  },

  uploadSuiviPhoto: async (suiviId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    await api.postForm(`/suivis/${suiviId}/photos`, form);
    await useStore.loadSuivis();
  },

  loadUsers: async () => {
    const { data } = await api.get<User[]>("/admin/users");
    _users = data;
    emitChange();
  },

  createUser: async (body: { name: string; email: string; password: string; role?: Role }) => {
    const { data } = await api.post("/admin/users", body);
    await useStore.loadUsers();
    return data;
  },

  updateUser: async (id: number, body: { name?: string; email?: string; password?: string; role?: Role }) => {
    const { data } = await api.put(`/admin/users/${id}`, body);
    await useStore.loadUsers();
    return data;
  },
};

export const prospectionStateLabel: Record<ProspectionState, string> = {
  NEW: "Nouveau",
  INTERESTED: "Intéressé",
  NOT_INTERESTED: "Non intéressé",
  CONFIRMED: "Confirmé",
};
export const demandeStateLabel: Record<DemandeState, string> = {
  DATA_COLLECTION: "Collecte",
  SUBMITTED: "Soumise",
  VALIDATED: "Validée",
  REJECTED: "Refusée",
};
export const suiviStateLabel: Record<SuiviState, string> = {
  PREPARATION: "Préparation",
  CODIFICATION: "Codification",
  CONTROL: "Contrôle",
  INSTALLATION: "Installation",
  LIVE: "En service",
};
export const suiviSteps: SuiviState[] = ["PREPARATION", "CODIFICATION", "CONTROL", "INSTALLATION", "LIVE"];
export const leadSourceLabel: Record<LeadSource, string> = {
  WALK_IN: "Visite",
  WEBSITE: "Site web",
  FACEBOOK: "Facebook",
  PHONE: "Téléphone",
  OTHER: "Autre",
};
export const categoryLabel: Record<AgencyCategory, string> = {
  STANDARD: "Standard",
  HOT_SPOT: "Hot spot",
  RURAL: "Rural",
};
