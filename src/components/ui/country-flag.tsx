import type { ReactNode } from "react";

const flagDesigns: Record<string, ReactNode> = {
  AE: (
    <>
      <path fill="#ef3340" d="M0 0h6v16H0z" />
      <path fill="#009739" d="M6 0h18v5.34H6z" />
      <path fill="#fff" d="M6 5.33h18v5.34H6z" />
      <path fill="#111" d="M6 10.67h18V16H6z" />
    </>
  ),
  DE: (
    <>
      <path fill="#111" d="M0 0h24v5.34H0z" />
      <path fill="#d00" d="M0 5.33h24v5.34H0z" />
      <path fill="#ffce00" d="M0 10.67h24V16H0z" />
    </>
  ),
  US: (
    <>
      <path fill="#fff" d="M0 0h24v16H0z" />
      <path
        fill="#b22234"
        d="M0 0h24v2H0zm0 4h24v2H0zm0 4h24v2H0zm0 4h24v2H0z"
      />
      <path fill="#3c3b6e" d="M0 0h10.5v8.7H0z" />
      <g fill="#fff">
        <circle cx="2" cy="2" r=".45" />
        <circle cx="5" cy="2" r=".45" />
        <circle cx="8" cy="2" r=".45" />
        <circle cx="3.5" cy="4.2" r=".45" />
        <circle cx="6.5" cy="4.2" r=".45" />
        <circle cx="2" cy="6.4" r=".45" />
        <circle cx="5" cy="6.4" r=".45" />
        <circle cx="8" cy="6.4" r=".45" />
      </g>
    </>
  ),
  SA: (
    <>
      <path fill="#006c35" d="M0 0h24v16H0z" />
      <path
        fill="#fff"
        d="M5 6.2h14v1H5zm1.2 2.8h11.6v.7H6.2zM7.8 10.4h8.4v.6H7.8z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth=".8"
        d="M7 12.7h10"
      />
    </>
  ),
  IN: (
    <>
      <path fill="#ff9933" d="M0 0h24v5.34H0z" />
      <path fill="#fff" d="M0 5.33h24v5.34H0z" />
      <path fill="#138808" d="M0 10.67h24V16H0z" />
      <circle cx="12" cy="8" r="2" fill="none" stroke="#000080" strokeWidth=".55" />
    </>
  ),
  GB: (
    <>
      <path fill="#012169" d="M0 0h24v16H0z" />
      <path fill="#fff" d="m0 0 24 16h-4.2L0 2.8zm24 0L0 16h4.2L24 2.8z" />
      <path fill="#c8102e" d="m0 0 24 16h-2L0 1.4zm24 0L0 16h2L24 1.4z" />
      <path fill="#fff" d="M9.5 0h5v16h-5zM0 5.5h24v5H0z" />
      <path fill="#c8102e" d="M10.5 0h3v16h-3zM0 6.5h24v3H0z" />
    </>
  ),
  SG: (
    <>
      <path fill="#ed2939" d="M0 0h24v8H0z" />
      <path fill="#fff" d="M0 8h24v8H0z" />
      <circle cx="7" cy="4.1" r="2.3" fill="#fff" />
      <circle cx="7.8" cy="3.6" r="1.9" fill="#ed2939" />
      <path fill="#fff" d="m10 1.4.35 1.1h1.15l-.93.68.36 1.1L10 3.6l-.93.68.36-1.1-.93-.68h1.15z" />
    </>
  ),
  MY: (
    <>
      <path fill="#fff" d="M0 0h24v16H0z" />
      <path fill="#c8102e" d="M0 0h24v2H0zm0 4h24v2H0zm0 4h24v2H0zm0 4h24v2H0z" />
      <path fill="#010066" d="M0 0h10.5v8.5H0z" />
      <circle cx="4.3" cy="4.2" r="2.2" fill="#ffcc00" />
      <circle cx="5.1" cy="3.8" r="1.8" fill="#010066" />
      <path fill="#ffcc00" d="m7.7 1 .38 1.1h1.16l-.94.67.36 1.1-.96-.68-.95.68.36-1.1-.94-.67h1.16z" />
    </>
  ),
  AU: (
    <>
      <path fill="#00008b" d="M0 0h24v16H0z" />
      <path fill="#fff" d="M0 0 12 8H9L0 2zm12 0L0 8h3l9-6z" />
      <path fill="#c8102e" d="m0 0 12 8h-1.5L0 1zm12 0L0 8h1.5l10.5-7z" />
      <path fill="#fff" d="M4.5 0h3v8h-3zM0 2.5h12v3H0z" />
      <path fill="#c8102e" d="M5.3 0h1.4v8H5.3zM0 3.3h12v1.4H0z" />
      <path fill="#fff" d="m17 3 .4 1.1h1.2l-1 .7.4 1.2-1-.7-1 .7.4-1.2-1-.7h1.2zm3 7 .3.8h.9l-.75.55.3.9-.75-.55-.75.55.3-.9-.75-.55h.9z" />
    </>
  ),
  FR: (
    <>
      <path fill="#0055a4" d="M0 0h8v16H0z" />
      <path fill="#fff" d="M8 0h8v16H8z" />
      <path fill="#ef4135" d="M16 0h8v16h-8z" />
    </>
  ),
  IT: (
    <>
      <path fill="#009246" d="M0 0h8v16H0z" />
      <path fill="#fff" d="M8 0h8v16H8z" />
      <path fill="#ce2b37" d="M16 0h8v16h-8z" />
    </>
  ),
  JP: (
    <>
      <path fill="#fff" d="M0 0h24v16H0z" />
      <circle cx="12" cy="8" r="4.5" fill="#bc002d" />
    </>
  ),
  CN: (
    <>
      <path fill="#de2910" d="M0 0h24v16H0z" />
      <path fill="#ffde00" d="m5 2 .75 2.1H8L6.2 5.4l.7 2.1L5 6.2l-1.9 1.3.7-2.1L2 4.1h2.3z" />
      <circle cx="9.2" cy="2.1" r=".65" fill="#ffde00" />
      <circle cx="10.5" cy="4" r=".65" fill="#ffde00" />
      <circle cx="10.3" cy="6.2" r=".65" fill="#ffde00" />
      <circle cx="9" cy="8" r=".65" fill="#ffde00" />
    </>
  ),
  CA: (
    <>
      <path fill="#fff" d="M0 0h24v16H0z" />
      <path fill="#d80621" d="M0 0h6v16H0zm18 0h6v16h-6z" />
      <path
        fill="#d80621"
        d="m12 3 .85 2.2 1.4-.8-.4 2 1.5-.2-1.2 1.6 1.1.7-2.1.5.5 2h-3.3l.5-2-2.1-.5 1.1-.7-1.2-1.6 1.5.2-.4-2 1.4.8z"
      />
    </>
  ),
};

export function CountryFlag({ code }: { code: string }) {
  const normalizedCode = code.toUpperCase();
  const design = flagDesigns[normalizedCode];

  if (!design) return null;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 16"
      className="h-[13px] w-[18px] shrink-0 rounded-[2px] border border-slate-200/80"
      focusable="false"
    >
      {design}
    </svg>
  );
}
