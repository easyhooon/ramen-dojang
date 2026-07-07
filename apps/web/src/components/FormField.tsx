import type { ReactNode } from "react";

export function FormField({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={["form-field", className].filter(Boolean).join(" ")}>
      <span className="field-label">{label}</span>
      {children}
    </div>
  );
}
