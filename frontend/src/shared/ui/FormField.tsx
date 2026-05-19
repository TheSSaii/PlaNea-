import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

type FormCardProps = {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
};

export function FormCard({ label, children, hint, className = '' }: FormCardProps) {
  return (
    <div className={`form-card ${className}`.trim()}>
      <label className="form-label">{label}</label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input-field ${className}`.trim()} {...props} />;
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`input-field input-textarea ${className}`.trim()} {...props} />;
}
