// frontend/src/pages/MapPage.tsx
// Main page component — composes LeafletMap + FilterBar + PlaceCard
import React, { useCallback } from 'react';
import { LeafletMap } from '../components/Map/LeafletMap';
import { FilterBar } from '../components/Map/FilterBar';
import { PlaceCard } from '../components/Map/PlaceCard';
import { usePlaces } from '../hooks/usePlaces';
import { type Place, type PriceLevel } from '../types/place.types';
import '../components/Map/map.css';

export function MapPage() {
  const {
    places,
    categories,
    filters,
    loading,
    error,
    userPosition,
    selectedPlace,
    setSelectedPlace,
    updateFilter,
    toggleCategory,
    resetFilters,
  } = usePlaces();

  const handlePlaceSelect = useCallback(
    (place: Place) => setSelectedPlace(place),
    [setSelectedPlace],
  );

  const handleViewDetail = useCallback((place: Place) => {
    // Navigate to place detail page
    // e.g. navigate(`/places/${place.id}`)
    console.log('Navigate to place:', place.id);
  }, []);

  const handleGetDirections = useCallback((_place: Place) => {
    // El routing se activa automáticamente al seleccionar el lugar
    // Este botón puede usarse para hacer scroll al mapa si estás en mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div style={styles.page}>
      {/* Full-screen map */}
      <div style={styles.mapArea}>
        <LeafletMap
          places={places}
          selectedPlace={selectedPlace}
          onPlaceSelect={handlePlaceSelect}
          userPosition={userPosition}
        />
      </div>

      {/* Top overlay: filters */}
      <div style={styles.topOverlay}>
        <FilterBar
          filters={filters}
          categories={categories}
          onSearchChange={(v) => updateFilter('search', v)}
          onToggleCategory={toggleCategory}
          onPriceLevelChange={(v) => updateFilter('priceLevel', v as PriceLevel | '')}
          onResetFilters={resetFilters}
        />
      </div>

      {/* Loading indicator */}
      {loading && (
        <div style={styles.loadingBadge}>
          <span style={styles.spinner} />
          Buscando lugares...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={styles.errorBadge}>⚠️ {error}</div>
      )}

      {/* Results count badge */}
      {!loading && !error && places.length > 0 && !selectedPlace && (
        <div style={styles.countBadge}>
          {places.length} {places.length === 1 ? 'lugar' : 'lugares'}
        </div>
      )}

      {/* No results */}
      {!loading && !error && places.length === 0 && (
        <div style={styles.emptyBadge}>
          😕 No encontramos lugares con esos filtros
        </div>
      )}

      {/* Bottom sheet: selected place card */}
      {selectedPlace && (
        <div style={styles.bottomSheet}>
          <PlaceCard
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            onViewDetail={handleViewDetail}
            onGetDirections={handleGetDirections}
          />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    overflow: 'hidden',
    background: '#F8FAFC',
  },
  mapArea: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: '12px 12px 0',
    pointerEvents: 'auto',
  },
  loadingBadge: {
    position: 'absolute',
    top: 140,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: '8px 16px',
    fontSize: 13,
    color: '#475569',
    boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    zIndex: 999,
    backdropFilter: 'blur(8px)',
  },
  spinner: {
    display: 'inline-block',
    width: 14,
    height: 14,
    border: '2px solid #E2E8F0',
    borderTop: '2px solid #2563EB',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBadge: {
    position: 'absolute',
    top: 140,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#FEF2F2',
    border: '1px solid #FCA5A5',
    borderRadius: 20,
    padding: '8px 16px',
    fontSize: 13,
    color: '#DC2626',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    zIndex: 999,
    whiteSpace: 'nowrap',
  },
  countBadge: {
    position: 'absolute',
    top: 140,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    color: '#475569',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    zIndex: 999,
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(8px)',
  },
  emptyBadge: {
    position: 'absolute',
    top: 140,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: '8px 16px',
    fontSize: 13,
    color: '#64748B',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    zIndex: 999,
    whiteSpace: 'nowrap',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1001,
    animation: 'slideUp 0.25s ease-out',
  },
};
