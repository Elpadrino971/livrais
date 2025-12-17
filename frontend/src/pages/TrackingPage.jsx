import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { ArrowLeft, Phone, MessageCircle, Navigation, MapPin, Clock, Package } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Custom icons
const delivererIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    width: 40px;
    height: 40px;
    background: #064E3B;
    border: 4px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  "><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const pickupIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    width: 32px;
    height: 32px;
    background: #10B981;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const dropoffIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    width: 32px;
    height: 32px;
    background: #F59E0B;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Auto-center map component
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function TrackingPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([4.9372, -52.3267]);

  useEffect(() => {
    fetchTracking();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTracking, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchTracking = async () => {
    try {
      const res = await axios.get(`${API}/tracking/${id}`);
      setTrackingData(res.data);
      
      // Center map on deliverer if available
      if (res.data.current_location) {
        setMapCenter([res.data.current_location.lat, res.data.current_location.lng]);
      } else if (res.data.request?.pickup_location) {
        setMapCenter([res.data.request.pickup_location.lat, res.data.request.pickup_location.lng]);
      }
    } catch (error) {
      console.error("Error fetching tracking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!trackingData?.request) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Livraison introuvable</div>
      </div>
    );
  }

  const { request, deliverer, current_location, tracking_history } = trackingData;
  
  // Create polyline from tracking history
  const trackingPath = tracking_history
    ?.map(point => [point.lat, point.lng])
    .reverse() || [];

  return (
    <div className="h-screen flex flex-col" data-testid="tracking-page">
      {/* Header */}
      <header className="glass border-b border-border px-4 py-3 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">Suivi en temps réel</h1>
            <p className="text-sm text-muted-foreground">{request.title}</p>
          </div>
          <Badge className={request.status === "accepted" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}>
            {request.status === "accepted" ? "En cours" : t(`status.${request.status}`)}
          </Badge>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={14}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={mapCenter} />
          
          {/* Pickup marker */}
          {request.pickup_location && (
            <Marker 
              position={[request.pickup_location.lat, request.pickup_location.lng]}
              icon={pickupIcon}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-medium text-emerald-700">Départ</p>
                  <p className="text-sm">{request.pickup_location.address}</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Dropoff marker */}
          {request.dropoff_location && (
            <Marker 
              position={[request.dropoff_location.lat, request.dropoff_location.lng]}
              icon={dropoffIcon}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-medium text-amber-700">Arrivée</p>
                  <p className="text-sm">{request.dropoff_location.address}</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Deliverer marker */}
          {current_location && (
            <Marker 
              position={[current_location.lat, current_location.lng]}
              icon={delivererIcon}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-medium">{deliverer?.name || "Livreur"}</p>
                  <p className="text-sm text-muted-foreground">Position actuelle</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Tracking path */}
          {trackingPath.length > 1 && (
            <Polyline 
              positions={trackingPath}
              color="#064E3B"
              weight={4}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
        
        {/* Floating info card */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="card-glass p-4">
            {deliverer ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xl">
                  {deliverer.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{deliverer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {deliverer.vehicle_type === "car" ? "🚗" : deliverer.vehicle_type === "pickup" ? "🛻" : "🚐"} {t(`vehicle.${deliverer.vehicle_type}`)}
                  </p>
                  {current_location && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      GPS actif
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {deliverer.phone && (
                    <a href={`tel:${deliverer.phone}`} className="p-3 rounded-full bg-emerald-100 text-emerald-700">
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                  <button 
                    onClick={() => navigate(`/request/${id}`)}
                    className="p-3 rounded-full bg-stone-100 dark:bg-stone-800"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-muted-foreground">En attente d'un livreur...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="glass border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Départ</p>
            <p className="font-medium truncate">{request.pickup_location?.address || "Point de départ"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Arrivée</p>
            <p className="font-medium truncate">{request.dropoff_location?.address || "Point d'arrivée"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
