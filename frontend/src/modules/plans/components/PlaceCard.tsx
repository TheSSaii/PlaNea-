import React from 'react';
import { type Place, PRICE_LEVEL_LABELS } from '../types/place.types';

interface PlaceCardProps {
  place: Place;
  onClose: () => void;
  onViewDetail?: (place: Place) => void;
  onGetDirections?: (place: Place) => void;
  onAddToPlan?: (place: Place) => void;
  addingToPlan?: boolean;
}

function StarRating({ rating, count }: { rating: number | null; count: number }) {
  if (!rating) return <span style={styles.noRating}>Sin resenas aun</span>;
  return (
    <span style={styles.ratingRow}>
      <span style={styles.star}>*</span>
      <span style={styles.ratingValue}>{rating.toFixed(1)}</span>
      <span style={styles.ratingCount}>({count})</span>
    </span>
  );
}

function PriceBadge({ level }: { level: string | null }) {
  if (!level) return null;
  const label = PRICE_LEVEL_LABELS[level as keyof typeof PRICE_LEVEL_LABELS] ?? level;
  return <span style={styles.priceBadge}>{label}</span>;
}

export function PlaceCard({
  place,
  onClose,
  onViewDetail,
  onGetDirections,
  onAddToPlan,
  addingToPlan = false,
}: PlaceCardProps) {
  const primaryCategory = place.categories[0]?.name ?? null;

  return (
    <div style={styles.card}>
      <div style={styles.handle} />

      <div style={styles.header}>
        <div style={styles.coverWrap}>
          {place.coverPhoto ? (
            <img src={place.coverPhoto} alt={place.name} style={styles.cover} />
          ) : (
            <div style={styles.coverPlaceholder}>Q</div>
          )}
        </div>

        <div style={styles.info}>
          <p style={styles.name}>{place.name}</p>

          <div style={styles.metaRow}>
            {primaryCategory && <span style={styles.categoryChip}>{primaryCategory}</span>}
            <PriceBadge level={place.priceLevel} />
          </div>

          <div style={styles.statsRow}>
            <StarRating rating={place.avgRating} count={place.reviewCount} />
            {place.distanceKm != null && (
              <span style={styles.distance}>
                {place.distanceKm < 1
                  ? `${Math.round(place.distanceKm * 1000)} m`
                  : `${place.distanceKm.toFixed(1)} km`}
              </span>
            )}
          </div>

          {place.openingHoursText && <p style={styles.hours}>{place.openingHoursText}</p>}
        </div>

        <button onClick={onClose} style={styles.closeBtn} aria-label="Cerrar">
          x
        </button>
      </div>

      {place.address && (
        <p style={styles.address}>
          <span style={styles.addressIcon}>M</span>
          {place.address}
        </p>
      )}

      <div style={styles.actions}>
        <button
          style={{ ...styles.ctaButton, flex: 1, background: '#F1F5F9', color: '#1E293B' }}
          onClick={() => onGetDirections?.(place)}
        >
          Como llegar
        </button>
        <button style={{ ...styles.ctaButton, flex: 1 }} onClick={() => onViewDetail?.(place)}>
          Ver detalle
        </button>
        {onAddToPlan && (
          <button
            style={{ ...styles.ctaButton, flex: 1, background: '#16A34A' }}
            onClick={() => onAddToPlan(place)}
            disabled={addingToPlan}
          >
            {addingToPlan ? 'Agregando...' : 'Anadir al plan'}
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#FFFFFF',
    borderRadius: '20px 20px 0 0',
    padding: '12px 16px 24px',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 544,
    width: '100%',
    margin: '0 auto',
  },
  handle: {
    width: 40,
    height: 4,
    background: '#E2E8F0',
    borderRadius: 2,
    margin: '0 auto 4px',
  },
  header: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  coverWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  cover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    background: '#EFF6FF',
    color: '#2563EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 800,
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  name: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#1E293B',
    lineHeight: 1.3,
  },
  metaRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryChip: {
    fontSize: 12,
    color: '#2563EB',
    background: '#EFF6FF',
    borderRadius: 20,
    padding: '2px 8px',
    fontWeight: 600,
  },
  priceBadge: {
    fontSize: 12,
    color: '#059669',
    background: '#ECFDF5',
    borderRadius: 20,
    padding: '2px 8px',
    fontWeight: 700,
  },
  statsRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  star: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: 900,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1E293B',
  },
  ratingCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  noRating: {
    fontSize: 12,
    color: '#94A3B8',
  },
  distance: {
    fontSize: 12,
    color: '#64748B',
    background: '#F8FAFC',
    padding: '2px 6px',
    borderRadius: 6,
  },
  hours: {
    margin: 0,
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    background: '#F1F5F9',
    border: 'none',
    borderRadius: '50%',
    width: 30,
    height: 30,
    cursor: 'pointer',
    color: '#64748B',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: 0,
  },
  address: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#64748B',
  },
  addressIcon: {
    width: 22,
    height: 22,
    borderRadius: 999,
    background: '#F1F5F9',
    color: '#475569',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 800,
    flexShrink: 0,
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 8,
  },
  ctaButton: {
    minHeight: 44,
    padding: '12px 10px',
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
};
