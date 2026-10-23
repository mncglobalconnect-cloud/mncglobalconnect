"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";

export function BookmarkButton({ title }: { title: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-label={`${saved ? "Remove saved" : "Save"} ${title}`}
      aria-pressed={saved}
      onClick={() => setSaved((value) => !value)}
      className={`flex size-9 items-center justify-center rounded-full border border-white/80 bg-white/95 shadow-sm backdrop-blur transition hover:scale-105 hover:bg-white ${saved ? "text-[#148ce0]" : "text-slate-600"}`}
    >
      <Bookmark
        aria-hidden="true"
        className={`size-4 ${saved ? "fill-current" : ""}`}
      />
    </button>
  );
}
