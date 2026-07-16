import { useSyncExternalStore, useCallback } from "react";
import { useStore } from "./ouvertures-store";

export function useProspections() {
  return useSyncExternalStore(
    useStore.subscribe,
    useCallback(() => useStore.getState().prospections, []),
    useCallback(() => useStore.getState().prospections, [])
  );
}

export function useDemandes() {
  return useSyncExternalStore(
    useStore.subscribe,
    useCallback(() => useStore.getState().demandes, []),
    useCallback(() => useStore.getState().demandes, [])
  );
}

export function useSuivis() {
  return useSyncExternalStore(
    useStore.subscribe,
    useCallback(() => useStore.getState().suivis, []),
    useCallback(() => useStore.getState().suivis, [])
  );
}
