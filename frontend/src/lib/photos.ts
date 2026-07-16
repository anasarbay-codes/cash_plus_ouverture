import agency1 from "@/assets/agency-1.jpg";
import agency2 from "@/assets/agency-2.jpg";
import localEmpty from "@/assets/local-empty.jpg";
import localFitout from "@/assets/local-fitout.png";
import hero from "@/assets/hero-banner.jpg";
import type { Photo } from "./ouvertures-store";

export const heroBanner = hero;
export const agencyThumbs = [agency1, agency2];

const pool = [localEmpty, agency1, localFitout, agency2, localEmpty, localFitout];

function pickMock(seed: string, i: number) {
  const h = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[(h + i) % pool.length];
}

export function pickPhoto(id: number, i: number) {
  return pickMock(String(id), i);
}

export function agencyThumb(id: number) {
  return agencyThumbs[id % agencyThumbs.length];
}

export function photoUrl(demandeId: number, photo: Photo): string {
  if (photo.file_path) {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    return `${base}/demandes/${demandeId}/photos/${photo.id}/file`;
  }
  return pickPhoto(demandeId, 0);
}

export function suiviPhotoUrl(suiviId: number, photo: Photo): string {
  if (photo.file_path) {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    return `${base}/suivis/${suiviId}/photos/${photo.id}/file`;
  }
  return pickPhoto(suiviId, 0);
}
