import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";

interface PhotoImgProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export function PhotoImg({ src, alt, className, onClick }: PhotoImgProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const prevSrc = useRef(src);

  useEffect(() => {
    if (!src.startsWith("http")) {
      setBlobUrl(null);
      return;
    }

    let cancelled = false;

    api.get(src, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        const url = URL.createObjectURL(res.data);
        setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(null);
      });

    return () => {
      cancelled = true;
      if (prevSrc.current === src) return;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [src]);

  return (
    <img
      src={blobUrl ?? src}
      alt={alt}
      className={className}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    />
  );
}
