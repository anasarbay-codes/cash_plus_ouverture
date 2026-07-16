import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "AGENT" | "VALIDATEUR" | "MANAGER";

interface AuthState {
  token: string | null;
  name: string | null;
  email: string | null;
  role: Role | null;
  authed: boolean;
  login: (token: string, name: string, email: string, role: Role) => void;
  logout: () => void;
  setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      name: null,
      email: null,
      role: null,
      authed: false,
      login: (token, name, email, role) =>
        set({ token, name, email, role, authed: true }),
      logout: () =>
        set({ token: null, name: null, email: null, role: null, authed: false }),
      setRole: (role) => set({ role }),
    }),
    { name: "cashplus-auth" }
  )
);
