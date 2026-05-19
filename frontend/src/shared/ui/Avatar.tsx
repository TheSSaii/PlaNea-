export function Avatar({ name, size = 'md' }: { name?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?';
  return <span className={`avatar avatar--${size}`}>{initial}</span>;
}
