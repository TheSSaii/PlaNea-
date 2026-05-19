// frontend/src/components/Map/LeafletMap.tsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet/dist/leaflet.css';
import { type Place } from '../../types/place.types';
import { getCategoryColor } from '../../types/place.types';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
  userPosition: GeolocationCoordinates | null;
  center?: [number, number];
  zoom?: number;
}

/** Creates a custom SVG pin marker with color based on primary category */
function createMarkerIcon(place: Place, isSelected: boolean): L.DivIcon {
  const color =
    place.categories.length > 0
      ? getCategoryColor(place.categories[0].name)
      : '#718096';

  const size = isSelected ? 44 : 34;
  const svg = `
    <svg width="${size}" height="${size + 8}" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <filter id="sh">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
      <circle cx="20" cy="20" r="18" fill="${color}" filter="url(#sh)" opacity="${isSelected ? 1 : 0.9}"/>
      <circle cx="20" cy="20" r="18" fill="none" stroke="white" stroke-width="${isSelected ? 3 : 2}"/>
      <polygon points="14,32 26,32 20,44" fill="${color}"/>
      <circle cx="20" cy="20" r="8" fill="white" opacity="0.9"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

function createUserIcon(): L.DivIcon {
  const svg = `
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" fill="#3B82F6" stroke="white" stroke-width="2"/>
      <circle cx="10" cy="10" r="4" fill="white"/>
    </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [20, 20], iconAnchor: [10, 10] });
}

export function LeafletMap({
  places,
  selectedPlace,
  onPlaceSelect,
  userPosition,
  center = [6.244203, -75.581211], // Medellín default
  zoom = 13,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  const routingRef = useRef<L.Routing.Control | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Tile layer: CartoDB Positron (clean, light)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution bottom-left minimal
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OSM</a>')
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when places change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers not in new set
    const newIds = new Set(places.map((p) => p.id));
    markersRef.current.forEach((marker, id) => {
      if (!newIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;

      if (markersRef.current.has(place.id)) {
        // Update icon if selection changed
        const existing = markersRef.current.get(place.id)!;
        existing.setIcon(createMarkerIcon(place, isSelected));
        return;
      }

      const marker = L.marker([place.latitude, place.longitude], {
        icon: createMarkerIcon(place, isSelected),
        title: place.name,
      });

      marker.on('click', () => onPlaceSelect(place));

      // Minimal tooltip on hover
      marker.bindTooltip(place.name, {
        direction: 'top',
        offset: [0, -34],
        className: 'queplan-tooltip',
      });

      marker.addTo(map);
      markersRef.current.set(place.id, marker);
    });
  }, [places, selectedPlace, onPlaceSelect]);

  // Pan/zoom to selected place
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlace) return;
    map.flyTo([selectedPlace.latitude, selectedPlace.longitude], 16, {
      duration: 0.8,
      easeLinearity: 0.25,
    });
    // Re-render marker to show selected state
    const marker = markersRef.current.get(selectedPlace.id);
    if (marker) marker.setIcon(createMarkerIcon(selectedPlace, true));
  }, [selectedPlace]);

  // User position marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPosition) return;

    if (userMarkerRef.current) userMarkerRef.current.remove();

    const marker = L.marker(
      [userPosition.latitude, userPosition.longitude],
      { icon: createUserIcon(), zIndexOffset: 1000 },
    )
      .addTo(map)
      .bindTooltip('Tu ubicación', { direction: 'top', permanent: false });

    userMarkerRef.current = marker;

    // Center map on user the first time
    map.setView([userPosition.latitude, userPosition.longitude], zoom);
  }, [userPosition]);


  useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  // Eliminar ruta anterior si existe
  if (routingRef.current) {
    map.removeControl(routingRef.current);
    routingRef.current = null;
  }

  // Solo trazar ruta si hay lugar seleccionado Y ubicación del usuario
  if (!selectedPlace || !userPosition) return;

  const control = L.Routing.control({
    waypoints: [
      L.latLng(userPosition.latitude, userPosition.longitude),
      L.latLng(selectedPlace.latitude, selectedPlace.longitude),
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    fitSelectedRoutes: true,
    show: false, // oculta el panel de instrucciones de texto
    lineOptions: {
      styles: [{ color: '#2563EB', weight: 5, opacity: 0.8 }],
      extendToWaypoints: true,
      missingRouteTolerance: 0,
    },
     // no crea marcadores propios, usamos los nuestros
  });

  control.addTo(map);
  routingRef.current = control;
}, [selectedPlace, userPosition]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%', minHeight: 400 }}
    />
  );
}

