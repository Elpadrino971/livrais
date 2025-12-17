import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MapPin, Clock, Truck, Users } from "lucide-react";
import { Badge } from "./ui/badge";

const requestTypeIcons = {
  heavy: "📦",
  groceries: "🛒",
  transport: "🚗",
};

const statusColors = {
  pending: "status-pending",
  accepted: "status-accepted",
  in_progress: "status-in_progress",
  completed: "status-completed",
  cancelled: "status-cancelled",
};

export default function RequestCard({ request, showActions = false, onAccept = null }) {
  const { t } = useTranslation();

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div 
      className="card p-5 animate-slide-up"
      data-testid={`request-card-${request.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{requestTypeIcons[request.request_type] || "📦"}</span>
          <div>
            <h3 className="font-semibold text-foreground">{request.title}</h3>
            <p className="text-sm text-muted-foreground">{t(`request.${request.request_type}`)}</p>
          </div>
        </div>
        <Badge className={statusColors[request.status]}>
          {t(`status.${request.status}`)}
        </Badge>
      </div>

      {request.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {request.description}
        </p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="text-muted-foreground truncate">
            {request.pickup_location?.address || "Départ"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-amber-500" />
          <span className="text-muted-foreground truncate">
            {request.dropoff_location?.address || "Arrivée"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        {request.vehicle_type && (
          <div className="flex items-center gap-1">
            <Truck className="w-4 h-4" />
            <span>{t(`vehicle.${request.vehicle_type}`)}</span>
          </div>
        )}
        {request.needs_helper && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>+1</span>
          </div>
        )}
        {request.desired_time && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{request.desired_time}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="price-tag">
          {request.proposed_price}€
        </div>
        
        <div className="flex items-center gap-2">
          {showActions && request.status === "pending" && onAccept && (
            <button
              onClick={() => onAccept(request.id)}
              className="btn-primary py-2 px-4 text-sm"
              data-testid={`accept-request-${request.id}`}
            >
              {t("deliverer.acceptRequest")}
            </button>
          )}
          
          <Link
            to={`/request/${request.id}`}
            className="text-sm font-medium text-primary hover:underline"
            data-testid={`view-request-${request.id}`}
          >
            Voir détails →
          </Link>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {formatTime(request.created_at)}
      </p>
    </div>
  );
}
