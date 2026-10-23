import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "text";

const variants: Record<ButtonVariant, string> = {
  primary:
    "brand-gradient border-transparent text-white shadow-[0_8px_24px_rgba(20,140,224,0.24)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(20,140,224,0.32)]",
  secondary:
    "border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
  text: "border-transparent bg-transparent text-current hover:bg-white/10",
};

type ButtonBaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type LinkButtonProps = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
  };

type NativeButtonProps = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: never;
  };

type ButtonProps = LinkButtonProps | NativeButtonProps;

function isLinkButton(props: ButtonProps): props is LinkButtonProps {
  return typeof props.href === "string";
}

export function Button(props: ButtonProps) {
  const variant = props.variant ?? "primary";
  const className = props.className ?? "";
  const classes = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-200 ${variants[variant]} ${className}`;

  if (isLinkButton(props)) {
    const { href, children, variant: _variant, className: _className, ...linkProps } = props;
    void _variant;
    void _className;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { children, variant: _variant, className: _className, ...buttonProps } = props;
  void _variant;
  void _className;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
