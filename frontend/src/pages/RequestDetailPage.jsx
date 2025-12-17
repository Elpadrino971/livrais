import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Clock, Truck, Users, MessageCircle, Star, CreditCard, X, Send, Navigation, ZoomIn } from "lucide-react";
import { Link } from "react-router-dom";
import Map from "../components/Map";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusColors = {
  pending: "status-pending",
  accepted: "status-accepted",
  in_progress: "status-in_progress",
  completed: "status-completed",
  cancelled: "status-cancelled",
};

export default function RequestDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  
  const [request, setRequest] = useState(null);
  const [deliverer, setDeliverer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showPhotoZoom, setShowPhotoZoom] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  useEffect(() => {
    fetchRequest();
  }, [id]);

  useEffect(() => {
    if (showChat) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [showChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchRequest = async () => {
    try {
      const res = await axios.get(`${API}/requests/${id}`);
      setRequest(res.data);
      
      if (res.data.deliverer_id) {
        const delivererRes = await axios.get(`${API}/deliverers/${res.data.deliverer_id}`);
        setDeliverer(delivererRes.data);
      }
    } catch (error) {
      console.error("Error fetching request:", error);
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/chat/${id}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await axios.post(`${API}/chat`, {
        request_id: id,
        sender_type: "client",
        sender_name: request.client_name,
        message: newMessage,
      });
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handlePayment = async () => {
    try {
      const res = await axios.post(`${API}/payments/create-checkout?request_id=${id}`, {}, {
        headers: { origin: window.location.origin }
      });
      window.location.href = res.data.checkout_url;
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error(t("common.error"));
    }
  };

  const handleComplete = async () => {
    try {
      await axios.post(`${API}/requests/${id}/complete`);
      toast.success("Livraison terminée!");
      setShowRating(true);
      fetchRequest();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette demande?")) return;
    
    try {
      await axios.post(`${API}/requests/${id}/cancel`);
      toast.success("Demande annulée");
      fetchRequest();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const submitRating = async () => {
    try {
      await axios.post(`${API}/ratings`, {
        request_id: id,
        deliverer_id: request.deliverer_id,
        rating,
        comment: ratingComment,
      });
      toast.success("Merci pour votre évaluation!");
      setShowRating(false);
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Demande introuvable</div>
      </div>
    );
  }

  return (
    <div className="pb-24" data-testid="request-detail-page">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-lg line-clamp-1">{request.title}</h1>
              <Badge className={statusColors[request.status]}>
                {t(`status.${request.status}`)}
              </Badge>
            </div>
          </div>
          
          {request.deliverer_id && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowChat(true)}
              className="relative"
              data-testid="chat-btn"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Map */}
      <div className="px-4 pt-4">
        <Map
          requests={[request]}
          className="h-[200px]"
        />
      </div>

      {/* Details */}
      <div className="p-4 space-y-4">
        {/* Locations */}
        <div className="card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Départ</p>
              <p className="font-medium">{request.pickup_location?.address || "Coordonnées GPS"}</p>
            </div>
          </div>
          
          <div className="border-l-2 border-dashed border-border ml-4 h-4" />
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arrivée</p>
              <p className="font-medium">{request.dropoff_location?.address || "Coordonnées GPS"}</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="card p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <span>{t(`vehicle.${request.vehicle_type}`) || "Tout véhicule"}</span>
            </div>
            {request.needs_helper && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span>Aide requise</span>
              </div>
            )}
            {request.desired_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span>{request.desired_time}</span>
              </div>
            )}
          </div>
          
          {request.description && (
            <p className="mt-4 text-muted-foreground">{request.description}</p>
          )}
        </div>

        {/* Deliverer (if accepted) */}
        {deliverer && (
          <div className="card p-4">
            <h3 className="font-medium mb-3">Votre livreur</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-semibold text-lg">
                {deliverer.name?.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{deliverer.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{deliverer.rating?.toFixed(1) || "5.0"}</span>
                  <span>•</span>
                  <span>{deliverer.total_deliveries} livraisons</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="card p-4 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t("payment.total")}</span>
            <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
              {request.proposed_price}€
            </span>
          </div>
          <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
            {t("payment.platformFee")}: {(request.proposed_price * 0.15).toFixed(2)}€
          </p>
        </div>

        {/* Photo if available - Compact thumbnail with zoom */}
        {request.photo_url && (
          <div className="card p-3">
            <div className="flex items-center gap-3">
              {/* Thumbnail */}
              <div 
                className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
                onClick={() => setShowPhotoZoom(true)}
                data-testid="request-photo"
              >
                <img 
                  src={request.photo_url} 
                  alt="Photo du produit" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <p className="font-medium text-foreground">Photo du produit</p>
                <p className="text-sm text-muted-foreground">Cliquez pour agrandir</p>
              </div>
              
              {/* Zoom button */}
              <button
                onClick={() => setShowPhotoZoom(true)}
                className="p-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors"
                data-testid="zoom-product-photo"
              >
                <ZoomIn className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Photo Zoom Dialog */}
        <Dialog open={showPhotoZoom} onOpenChange={setShowPhotoZoom}>
          <DialogContent className="max-w-3xl p-2 bg-black/95 border-0">
            <div className="relative">
              <img 
                src={request?.photo_url} 
                alt="Photo agrandie" 
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setShowPhotoZoom(false)}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          {/* Tracking button for accepted deliveries */}
          {(request.status === "accepted" || request.status === "in_progress") && (
            <Link to={`/tracking/${id}`} className="block">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="tracking-btn"
              >
                <Navigation className="w-5 h-5" />
                Suivre en temps réel
              </Button>
            </Link>
          )}

          {request.status === "accepted" && request.payment_status !== "paid" && (
            <Button 
              onClick={handlePayment}
              className="w-full btn-primary"
              data-testid="pay-btn"
            >
              <CreditCard className="w-5 h-5" />
              {t("payment.pay")} {request.proposed_price}€
            </Button>
          )}
          
          {request.status === "accepted" && request.payment_status === "paid" && (
            <Button 
              onClick={handleComplete}
              className="w-full btn-primary"
              data-testid="complete-btn"
            >
              Confirmer la livraison
            </Button>
          )}
          
          {(request.status === "pending" || request.status === "accepted") && (
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="w-full"
              data-testid="cancel-btn"
            >
              {t("common.cancel")}
            </Button>
          )}
        </div>
      </div>

      {/* Chat Dialog */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="max-w-md h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{t("chat.title")}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble ${msg.sender_type === "client" ? "chat-bubble-client" : "chat-bubble-deliverer"}`}
              >
                <p className="text-xs opacity-70 mb-1">{msg.sender_name}</p>
                <p>{msg.message}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("chat.placeholder")}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              data-testid="chat-input"
            />
            <Button onClick={sendMessage} size="icon" data-testid="send-message-btn">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("rating.title")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                  data-testid={`star-${star}`}
                >
                  <Star 
                    className={`w-8 h-8 transition-colors ${
                      star <= rating ? "text-amber-400 fill-amber-400" : "text-stone-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <Textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder={t("rating.comment")}
              data-testid="rating-comment"
            />
            
            <Button onClick={submitRating} className="w-full btn-primary" data-testid="submit-rating-btn">
              {t("rating.submit")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
