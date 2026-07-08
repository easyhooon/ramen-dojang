import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: "danger";
  display?: "full";
  variant?: "weak";
};

export function Button({ className, color, display, variant, ...props }: ButtonProps) {
  const tone = color === "danger" ? "danger" : variant === "weak" ? "button" : "primary";

  return <button className={[tone, display === "full" ? "full-width" : "", className].filter(Boolean).join(" ")} {...props} />;
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextField({ className, label, ...props }: TextFieldProps) {
  return (
    <label className={["form-control", className].filter(Boolean).join(" ")}>
      <span className="field-label">{label}</span>
      <input {...props} />
    </label>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  minHeight?: number;
};

export function TextArea({ className, label, minHeight, style, ...props }: TextAreaProps) {
  return (
    <label className={["form-control", className].filter(Boolean).join(" ")}>
      <span className="field-label">{label}</span>
      <textarea style={{ minHeight, ...style }} {...props} />
    </label>
  );
}

export function Badge({ children, color }: { children: ReactNode; color?: "elephant" | "green" | "yellow" }) {
  return <span className={["badge", color ? `badge--${color}` : ""].filter(Boolean).join(" ")}>{children}</span>;
}
