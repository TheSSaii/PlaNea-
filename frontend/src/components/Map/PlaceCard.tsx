// frontend/src/components/Map/PlaceCard.tsx
import React from 'react';
import { type Place, PRICE_LEVEL_LABELS } from '../../types/place.types';

interface PlaceCardProps {
  place: Place;
  onClose: () => void;
  onViewDetail?: (place: Place) => void;
  onGetDirections?: (place: Place) => void; //nuevo prop para manejar la acción de "Cómo llegar"
}

function StarRating({ rating, count }: { rating: number | null; count: number }) {
  if (!rating) return <span style={styles.noRating}>Sin reseñas aún</span>;
  return (
    <span style={styles.ratingRow}>
      <span style={styles.star}>★</span>
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

export function PlaceCard({ place, onClose, onViewDetail, onGetDirections }: PlaceCardProps) {
  const primaryCategory = place.categories[0]?.name ?? null;

  return (
    <div style={styles.card}>
      {/* Drag handle */}
      <div style={styles.handle} />

      {/* Header row */}
      <div style={styles.header}>
        <div style={styles.coverWrap}>
          {place.coverPhoto ? (
            <img src={place.coverPhoto} alt={place.name} style={styles.cover} />
          ) : (
            <div style={styles.coverPlaceholder}>
              <span style={{ fontSize: 28 }}>📍</span>
            </div>
          )}
        </div>

        <div style={styles.info}>
          <p style={styles.name}>{place.name}</p>

          <div style={styles.metaRow}>
            {primaryCategory && (
              <span style={styles.categoryChip}>{primaryCategory}</span>
            )}
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

          {place.openingHoursText && (
            <p style={styles.hours}>🕐 {place.openingHoursText}</p>
          )}
        </div>

        <button onClick={onClose} style={styles.closeBtn} aria-label="Cerrar">
          ✕
        </button>
      </div>

      {/* Address */}
      {place.address && (
        <p style={styles.address}>📍 {place.address}</p>
      )}

      {/* CTA button */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={{ ...styles.ctaButton, flex: 1, background: '#F1F5F9', color: '#1E293B' }}
          onClick={() => onGetDirections?.(place)}
        >
          🗺️ Cómo llegar
        </button>
        <button
          style={{ ...styles.ctaButton, flex: 1 }}
          onClick={() => onViewDetail?.(place)}
        >
          Ver detalle
        </button>
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
    gap: 10,
    maxWidth: 480,
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
    background: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  name: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
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
    fontWeight: 500,
  },
  priceBadge: {
    fontSize: 12,
    color: '#059669',
    background: '#ECFDF5',
    borderRadius: 20,
    padding: '2px 8px',
    fontWeight: 600,
  },
  statsRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  star: {
    color: '#F59E0B',
    fontSize: 14,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: 600,
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
    fontSize: 13,
    color: '#64748B',
    paddingLeft: 2,
  },
  ctaButton: {
    width: '100%',
    padding: '14px 0',
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
    transition: 'background 0.15s',
  },
};