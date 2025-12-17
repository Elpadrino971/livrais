import { useTranslation } from "react-i18next";
import { Star, Truck, MapPin } from "lucide-react";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const vehicleIcons = {
  car: "🚗",
  pickup: "🛻",
  van: "🚐",
};

const statusColors = {
  available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  busy: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  offline: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
};

export default function DelivererCard({ deliverer, onClick = null }) {
  const { t } = useTranslation();

  return (
    <div 
      className={`card p-4 ${onClick ? "cursor-pointer hover:shadow-lg transition-shadow duration-200" : ""}`}
      onClick={onClick}
      data-testid={`deliverer-card-${deliverer.id}`}
    >
      <div className="flex items-start gap-4">
        <Avatar className="w-14 h-14 border-2 border-emerald-100">
          <AvatarImage src={deliverer.photo_url} alt={deliverer.name} />
          <AvatarFallback className="bg-emerald-100 text-emerald-800 text-lg font-semibold">
            {deliverer.name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {deliverer.name}
              {deliverer.is_premium && (
                <span className="ml-2 text-amber-500" title="Premium">⭐</span>
              )}
            </h3>
            <Badge className={statusColors[deliverer.status]}>
              {t(`status.${deliverer.status}`)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{deliverer.rating?.toFixed(1) || "5.0"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{vehicleIcons[deliverer.vehicle_type] || "🚗"}</span>
              <span>{t(`vehicle.${deliverer.vehicle_type}`)}</span>
            </div>
            <span>({deliverer.total_deliveries || 0} livraisons)</span>
          </div>
          
          {deliverer.trip_announcement && (
            <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-400">
                {deliverer.trip_announcement}
              </p>
            </div>
          )}
          
          {deliverer.distance_km !== undefined && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
              📍 {deliverer.distance_km} km
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
