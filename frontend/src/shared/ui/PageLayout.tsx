import type { ReactNode } from 'react';

export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`page-shell ${className}`.trim()}>{children}</div>;
}

export function PageHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <header className="page-header">
      <div className={`page-header-inner ${className}`.trim()}>{children}</div>
    </header>
  );
}

export function PageContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`page-content ${className}`.trim()}>{children}</main>;
}

export function PageTitleBlock({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title-row">
      <div className="page-title-copy min-w-0 flex-1">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-title-action shrink-0">{action}</div>}
    </div>
  );
}
