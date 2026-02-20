import { memo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths broken by Vite's asset handling
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

/** Syncs the map view when lat/lng change externally (e.g. governorate selection) */
function MapSync({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

/** Registers click events on the map to place the marker */
function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

const MapPicker = memo(({ lat, lng, onChange }: MapPickerProps) => {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full rounded-lg"
      style={{ cursor: 'crosshair' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapSync lat={lat} lng={lng} />
      <ClickHandler onChange={onChange} />
      <Marker
        position={[lat, lng]}
        draggable
        eventHandlers={{
          dragend(e) {
            const { lat: newLat, lng: newLng } = (e.target as L.Marker).getLatLng();
            onChange(Number(newLat.toFixed(6)), Number(newLng.toFixed(6)));
          },
        }}
      />
    </MapContainer>
  );
});

MapPicker.displayName = 'MapPicker';
export default MapPicker;
