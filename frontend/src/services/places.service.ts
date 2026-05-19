import { type PlaceFilters, type PlacesResponse, type Category } from '../types/place.types';
 
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
 
function buildParams(
  filters: PlaceFilters,
  userPosition: GeolocationCoordinates | null,
  limit = 100,
  offset = 0,
): URLSearchParams {
  const params = new URLSearchParams();
 
  if (filters.search) params.set('search', filters.search);
  if (filters.categoryIds.length > 0)
    params.set('categories', filters.categoryIds.join(','));
  if (filters.interestIds.length > 0)
    params.set('interests', filters.interestIds.join(','));
  if (filters.priceLevel) params.set('priceLevel', filters.priceLevel);
  if (userPosition) {
    params.set('lat', String(userPosition.latitude));
    params.set('lng', String(userPosition.longitude));
  }
 
  params.set('limit', String(limit));
  params.set('offset', String(offset));
 
  return params;
}
 
export async function fetchPlaces(
  filters: PlaceFilters,
  userPosition: GeolocationCoordinates | null,
): Promise<PlacesResponse> {
  const params = buildParams(filters, userPosition);
  const res = await fetch(`${API_BASE}/places?${params.toString()}`);
  if (!res.ok) throw new Error(`Error fetching places: ${res.statusText}`);
  return res.json();
}
 
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/places/categories`);
  if (!res.ok) throw new Error(`Error fetching categories: ${res.statusText}`);
  return res.json();
}
