import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
};

export function Card({
  children,
  className = "",
  interactive = false,
  ...props
}: CardProps) {
  const interaction = interactive
    ? "transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    : "";

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[0_8px_30px_rgba(16,33,58,0.04)] ${interaction} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
