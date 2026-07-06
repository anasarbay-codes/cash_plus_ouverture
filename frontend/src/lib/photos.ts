import agency1 from "@/assets/agency-1.jpg";
import agency2 from "@/assets/agency-2.jpg";
import localEmpty from "@/assets/local-empty.jpg";
import localFitout from "@/assets/local-fitout.jpg";
import hero from "@/assets/hero-banner.jpg";

export const heroBanner = hero;
export const agencyThumbs = [agency1, agency2];

const pool = [localEmpty, agency1, localFitout, agency2, localEmpty, localFitout];

export function pickPhoto(seed: string, i: number) {
  const h = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[(h + i) % pool.length];
}

export function agencyThumb(seed: string) {
  const h = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  return agencyThumbs[h % agencyThumbs.length];
}