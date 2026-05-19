export type PriceLevel = 'FREE' | 'LOW' | 'MEDIUM' | 'HIGH';
 
export interface Category {
  id: string;
  name: string;
  placeCount?: number;
}
 
export interface Interest {
  id: string;
  name: string;
}
 
export interface Place {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  priceLevel: PriceLevel | null;
  avgCostCents: number | null;
  openingHoursText: string | null;
  phone: string | null;
  websiteUrl: string | null;
  coverPhoto: string | null;
  categories: Category[];
  interests: Interest[];
  avgRating: number | null;
  reviewCount: number;
  favoriteCount: number;
  checkInCount: number;
  distanceKm: number | null;
}
 
export interface PlacesResponse {
  data: Place[];
  total: number;
  limit: number;
  offset: number;
}
 
export interface PlaceFilters {
  search: string;
  categoryIds: string[];
  interestIds: string[];
  priceLevel: PriceLevel | '';
  radiusKm: number;
}
 
export const PRICE_LEVEL_LABELS: Record<PriceLevel, string> = {
  FREE: 'Gratis',
  LOW: '$',
  MEDIUM: '$$',
  HIGH: '$$$',
};
 
export const PRICE_LEVEL_DISPLAY: Record<PriceLevel, string> = {
  FREE: 'Gratis',
  LOW: 'Económico',
  MEDIUM: 'Moderado',
  HIGH: 'Premium',
};
 
// Category → color + icon for map markers
export const CATEGORY_COLORS: Record<string, string> = {
  Restaurante: '#E53E3E',
  Cafetería: '#DD6B20',
  Bar: '#805AD5',
  Parque: '#38A169',
  Museo: '#3182CE',
  Teatro: '#D53F8C',
  default: '#718096',
};
 
// Map icon SVG paths by category keyword
export const getCategoryColor = (categoryName: string): string => {
  const found = Object.keys(CATEGORY_COLORS).find((k) =>
    categoryName.toLowerCase().includes(k.toLowerCase()),
  );
  return found ? CATEGORY_COLORS[found] : CATEGORY_COLORS.default;
};