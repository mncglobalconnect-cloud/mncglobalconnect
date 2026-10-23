import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  light = false,
}: SectionHeadingProps) {
  return (
    <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--blue)]">
            {eyebrow}
          </p>
        )}
        <h2
          className={`text-3xl font-bold tracking-tight sm:text-4xl ${light ? "text-white" : "text-[var(--text)]"}`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-4 text-base leading-7 ${light ? "text-white/70" : "text-[var(--muted)]"}`}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
