import { useCallback, useRef, memo } from 'react';

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

/**
 * Lightweight map picker using OpenStreetMap tiles via an iframe approach.
 * No external map library required — uses a simple interactive pin via click events.
 */
const MapPicker = memo(({ lat, lng, onChange }: MapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  // We use a simple embedded tile view + click-to-place-pin approach
  // This avoids heavy dependencies like Leaflet
  const tileUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`;

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Convert pixel position to approximate lat/lng offset
      const newLng = lng - 0.05 + x * 0.1;
      const newLat = lat + 0.05 - y * 0.1;
      onChange(Number(newLat.toFixed(6)), Number(newLng.toFixed(6)));
    },
    [lat, lng, onChange],
  );

  return (
    <div ref={mapRef} className="relative h-full w-full cursor-crosshair" onClick={handleMapClick}>
      <iframe
        title="Map"
        src={tileUrl}
        className="h-full w-full border-0 pointer-events-none"
        loading="lazy"
      />
      {/* Pin indicator overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div ref={markerRef} className="flex flex-col items-center">
          <div className="h-6 w-6 rounded-full bg-primary border-2 border-primary-foreground shadow-lg" />
          <div className="h-3 w-0.5 bg-primary" />
        </div>
      </div>
      <div className="absolute bottom-2 left-2 rounded bg-card/90 px-2 py-1 text-xs text-muted-foreground shadow">
        Click to set location
      </div>
    </div>
  );
});

MapPicker.displayName = 'MapPicker';
export default MapPicker;
