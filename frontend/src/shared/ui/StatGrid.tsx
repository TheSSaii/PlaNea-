type StatTone = 'brand' | 'neutral' | 'success' | 'danger';

type StatItem = {
  label: string;
  value: string | number;
  tone?: StatTone;
};

const toneClass: Record<StatTone, string> = {
  brand: 'stat-card stat-card--brand',
  neutral: 'stat-card stat-card--neutral',
  success: 'stat-card stat-card--success',
  danger: 'stat-card stat-card--danger',
};

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="stat-grid">
      {items.map((item) => (
        <div key={item.label} className={toneClass[item.tone ?? 'neutral']}>
          <p className="stat-label">{item.label}</p>
          <p className="stat-value">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
