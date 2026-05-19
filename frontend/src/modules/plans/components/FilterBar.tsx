// Filters for plan place discovery.
import { useState } from 'react';
import { type PlaceFilters, type Category, type PriceLevel } from '../types/place.types';

interface FilterBarProps {
  filters: PlaceFilters;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onToggleCategory: (id: string) => void;
  onPriceLevelChange: (level: PriceLevel | '') => void;
  onResetFilters: () => void;
}

const PRICE_OPTIONS: Array<{ value: PriceLevel | ''; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'FREE', label: 'Gratis' },
  { value: 'LOW', label: '$' },
  { value: 'MEDIUM', label: '$$' },
  { value: 'HIGH', label: '$$$' },
];

export function FilterBar({
  filters,
  categories,
  onSearchChange,
  onToggleCategory,
  onPriceLevelChange,
  onResetFilters,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const activeFilterCount = filters.categoryIds.length + (filters.priceLevel ? 1 : 0);

  return (
    <div style={styles.wrapper}>
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>Q</span>
          <input
            type="text"
            placeholder="Que quieres hacer hoy?"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={styles.searchInput}
          />
          {filters.search && (
            <button
              style={styles.clearSearch}
              onClick={() => onSearchChange('')}
              aria-label="Limpiar busqueda"
            >
              x
            </button>
          )}
        </div>
        <button
          style={{
            ...styles.filterToggle,
            ...(activeFilterCount > 0 ? styles.filterToggleActive : {}),
          }}
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Filtros"
        >
          <span style={styles.filterIcon}>F</span>
          {activeFilterCount > 0 && <span style={styles.badge}>{activeFilterCount}</span>}
        </button>
      </div>

      <div style={styles.chipsRow}>
        {categories.slice(0, 8).map((cat) => {
          const active = filters.categoryIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              style={{
                ...styles.chip,
                ...(active ? styles.chipActive : {}),
              }}
              onClick={() => onToggleCategory(cat.id)}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {showFilters && (
        <div style={styles.expandedFilters}>
          <div style={styles.filterSection}>
            <p style={styles.filterLabel}>Precio</p>
            <div style={styles.priceRow}>
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  style={{
                    ...styles.priceChip,
                    ...(filters.priceLevel === opt.value ? styles.priceChipActive : {}),
                  }}
                  onClick={() => onPriceLevelChange(opt.value as PriceLevel | '')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button style={styles.resetBtn} onClick={onResetFilters}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: 'min(100%, 34rem)',
    margin: '0 auto',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
  },
  searchRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: '#F8FAFC',
    borderRadius: 12,
    padding: '0 12px',
    border: '1.5px solid #E2E8F0',
    gap: 8,
    minWidth: 0,
  },
  searchIcon: {
    width: 22,
    height: 22,
    borderRadius: 999,
    background: '#DBEAFE',
    color: '#2563EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 800,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'transparent',
    fontSize: 14,
    color: '#1E293B',
    padding: '10px 0',
    outline: 'none',
  },
  clearSearch: {
    width: 24,
    height: 24,
    background: '#E2E8F0',
    border: 'none',
    cursor: 'pointer',
    color: '#475569',
    fontSize: 12,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1.5px solid #E2E8F0',
    background: '#F8FAFC',
    cursor: 'pointer',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  filterIcon: {
    fontSize: 13,
    fontWeight: 800,
  },
  filterToggleActive: {
    background: '#EFF6FF',
    borderColor: '#2563EB',
    color: '#2563EB',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    background: '#2563EB',
    color: '#fff',
    borderRadius: '50%',
    width: 16,
    height: 16,
    fontSize: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
  chipsRow: {
    display: 'flex',
    gap: 6,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    paddingBottom: 2,
  },
  chip: {
    flexShrink: 0,
    padding: '5px 12px',
    borderRadius: 20,
    border: '1.5px solid #E2E8F0',
    background: '#F8FAFC',
    color: '#475569',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  chipActive: {
    background: '#2563EB',
    borderColor: '#2563EB',
    color: '#FFFFFF',
  },
  expandedFilters: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingTop: 8,
    borderTop: '1px solid #F1F5F9',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  filterLabel: {
    margin: 0,
    fontSize: 12,
    fontWeight: 600,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  priceRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  priceChip: {
    padding: '5px 14px',
    borderRadius: 20,
    border: '1.5px solid #E2E8F0',
    background: '#F8FAFC',
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  priceChipActive: {
    background: '#2563EB',
    borderColor: '#2563EB',
    color: '#FFFFFF',
  },
  resetBtn: {
    alignSelf: 'flex-start',
    padding: '6px 14px',
    borderRadius: 8,
    border: '1.5px solid #FCA5A5',
    background: '#FEF2F2',
    color: '#DC2626',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
};
