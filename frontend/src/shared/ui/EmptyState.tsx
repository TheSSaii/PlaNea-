import type { ReactNode } from 'react';
import { Button } from './Button';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  tone?: 'brand' | 'slate';
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  tone = 'brand',
}: EmptyStateProps) {
  return (
    <div className={`empty-state empty-state--${tone}`}>
      <div className="empty-state-body">
        {icon ?? (
          <div className="empty-state-icon" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )}
        <h2 className="empty-state-title">{title}</h2>
        <p className="empty-state-description">{description}</p>
        {actionLabel && onAction && (
          <Button variant="white" size="md" onClick={onAction} className="empty-state-action">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
