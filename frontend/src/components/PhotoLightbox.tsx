import { useEffect, useState } from "react";
import api from "@/lib/api";
import { X } from "lucide-react";

interface PhotoLightboxProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export function PhotoLightbox({ src, alt, onClose }: PhotoLightboxProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) { setBlobUrl(null); return; }
    if (!src.startsWith("http")) { setBlobUrl(null); return; }

    let cancelled = false;

    api.get(src, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        setBlobUrl(URL.createObjectURL(res.data));
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(null);
      });

    return () => { cancelled = true; };
  }, [src]);

  useEffect(() => {
    if (!src) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>
      {blobUrl ? (
        <img
          src={blobUrl}
          alt={alt ?? ""}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="text-white">Chargement...</div>
      )}
    </div>
  );
}
