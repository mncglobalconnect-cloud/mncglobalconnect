"use client";

import { AlertCircle, ChevronDown, Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

type FieldShellProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  action?: ReactNode;
  children: ReactNode;
};

/** Label, hint and animated error message shared by every control. */
function FieldShell({ id, label, error, hint, optional, action, children }: FieldShellProps) {
  return (
    <div className="form-field" data-invalid={error ? true : undefined}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-[#1d3150]">
          {label}
          {optional && <span className="ml-1.5 text-[12px] font-medium text-slate-400">(optional)</span>}
        </label>
        {action}
      </div>
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[12.5px] font-medium text-[#d6334a]"
          >
            <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" /> {error}
          </motion.p>
        ) : hint ? (
          <p id={`${id}-hint`} className="mt-1.5 text-[12.5px] text-slate-500">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
  optional?: boolean;
  action?: ReactNode;
};

export function TextField({ id, label, icon: Icon, error, hint, optional, action, className, ...input }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} action={action}>
      <div className="form-control-wrap">
        {Icon && <Icon aria-hidden="true" className="form-control-icon" />}
        <input
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`form-control ${Icon ? "pl-11" : ""} ${className ?? ""}`}
          {...input}
        />
      </div>
    </FieldShell>
  );
}

export function PasswordField(props: Omit<TextFieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  const { id, label, icon: Icon, error, hint, action, ...input } = props;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} action={action}>
      <div className="form-control-wrap">
        {Icon && <Icon aria-hidden="true" className="form-control-icon" />}
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`form-control pr-12 ${Icon ? "pl-11" : ""}`}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#082b59]"
        >
          {visible ? <EyeOff aria-hidden="true" className="size-[18px]" /> : <Eye aria-hidden="true" className="size-[18px]" />}
        </button>
      </div>
    </FieldShell>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  id: string;
  label: string;
  options: readonly string[];
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
  optional?: boolean;
};

export function SelectField({ id, label, options, placeholder = "Select an option", icon: Icon, error, hint, optional, ...select }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional}>
      <div className="form-control-wrap">
        {Icon && <Icon aria-hidden="true" className="form-control-icon" />}
        <select
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`form-control appearance-none pr-11 ${Icon ? "pl-11" : ""}`}
          {...select}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </div>
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

export function TextAreaField({ id, label, error, hint, optional, maxLength, value, className, ...textarea }: TextAreaFieldProps) {
  const length = typeof value === "string" ? value.length : 0;
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      optional={optional}
      action={maxLength ? <span className="text-[11.5px] tabular-nums text-slate-400">{length}/{maxLength}</span> : undefined}
    >
      <textarea
        id={id}
        name={id}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`form-control min-h-[132px] resize-y py-3 ${className ?? ""}`}
        {...textarea}
      />
    </FieldShell>
  );
}

export function CheckboxField({ id, children, ...input }: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> & { id: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="group inline-flex cursor-pointer items-start gap-2.5 text-[13px] text-slate-600">
      <input id={id} name={id} type="checkbox" className="form-checkbox" {...input} />
      <span className="leading-5">{children}</span>
    </label>
  );
}

/** Small circular spinner for submit buttons. */
export function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}
