import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icons
const createIcon = (color, size = 30) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

const delivererIcon = createIcon("#064E3B", 32);
const requestIcon = createIcon("#F59E0B", 28);
const userIcon = createIcon("#EC4899", 24);

// Component to handle map click
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

// Component to fly to location
function FlyToLocation({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 12, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function Map({
  deliverers = [],
  requests = [],
  userLocation = null,
  onLocationSelect = null,
  selectedLocation = null,
  center = [4.9372, -52.3267], // Default to French Guiana
  zoom = 12,
  className = "",
}) {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  // Update map when center/zoom props change
  useEffect(() => {
    setMapCenter(center);
    setMapZoom(zoom);
  }, [center, zoom]);

  return (
    <div className={`map-container ${className}`} data-testid="map-container">
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={zoom}
        className="w-full h-full rounded-2xl"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
        <FlyToLocation center={mapCenter} zoom={mapZoom} />
        
        {/* User location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>Votre position</Popup>
          </Marker>
        )}
        
        {/* Selected location for form */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={requestIcon}>
            <Popup>Position sélectionnée</Popup>
          </Marker>
        )}
        
        {/* Deliverers */}
        {deliverers.map((deliverer) => (
          <Marker
            key={deliverer.id}
            position={[deliverer.current_location?.lat || 0, deliverer.current_location?.lng || 0]}
            icon={delivererIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-emerald-900">{deliverer.name}</p>
                <p className="text-sm text-stone-600">{deliverer.vehicle_type}</p>
                <p className="text-sm text-amber-600">★ {deliverer.rating?.toFixed(1) || "5.0"}</p>
                {deliverer.trip_announcement && (
                  <p className="text-xs text-stone-500 mt-1">{deliverer.trip_announcement}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Active Requests */}
        {requests.map((request) => (
          <Marker
            key={request.id}
            position={[request.pickup_location?.lat || 0, request.pickup_location?.lng || 0]}
            icon={requestIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold">{request.title}</p>
                <p className="text-sm text-amber-600 font-medium">{request.proposed_price}€</p>
                <p className="text-xs text-stone-500">{request.request_type}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
