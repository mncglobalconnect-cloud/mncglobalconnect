"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef } from "react";

export function DocumentPreviewLink({ file }: { file: File }) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;
    const url = URL.createObjectURL(file);
    link.href = url;
    return () => {
      link.removeAttribute("href");
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <a ref={linkRef} target="_blank" rel="noopener noreferrer"
      aria-label={`View ${file.name} (opens in a new tab)`}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#0878c7] transition hover:border-[#148ce0]/40 focus-visible:ring-2 focus-visible:ring-[#148ce0]/40">
      <Eye aria-hidden="true" className="size-3.5" /> View
    </a>
  );
}
