// frontend/src/hooks/usePlaces.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { type Place, type PlaceFilters, type Category } from '../types/place.types';
import { fetchPlaces, fetchCategories } from '../services/places.service';
 
const DEFAULT_FILTERS: PlaceFilters = {
  search: '',
  categoryIds: [],
  interestIds: [],
  priceLevel: '',
  radiusKm: 10,
};
 
export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<PlaceFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<GeolocationCoordinates | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 
  // Get user geolocation once
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition(pos.coords),
      () => setUserPosition(null),
      { timeout: 5000 },
    );
  }, []);
 
  // Load categories once on mount
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((error: unknown) => console.error('Failed to load categories', error));
  }, []);
 
  // Debounced place fetch on filter change
  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPlaces(filters, userPosition);
      setPlaces(res.data);
    } catch {
      setError('No se pudo cargar los lugares. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filters, userPosition]);
 
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Debounce search input, immediate for other filters
    const delay = filters.search ? 400 : 0;
    debounceRef.current = setTimeout(loadPlaces, delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [loadPlaces, filters.search]);
 
  const updateFilter = useCallback(
    <K extends keyof PlaceFilters>(key: K, value: PlaceFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );
 
  const toggleCategory = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  }, []);
 
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);
 
  return {
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
  };
}
