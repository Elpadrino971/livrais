import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "sonner";
import { Power, MapPin, Navigation, Star, Package } from "lucide-react";
import Map from "../components/Map";
import RequestCard from "../components/RequestCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DelivererModePage() {
  const { t } = useTranslation();
  
  const [deliverer, setDeliverer] = useState(null);
  const [requests, setRequests] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tripAnnouncement, setTripAnnouncement] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    vehicle_type: "car",
  });

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 4.9372, lng: -52.3267 });
        }
      );
    }
    
    // Check for stored deliverer ID
    const delivererId = localStorage.getItem("deliverer_id");
    if (delivererId) {
      fetchDeliverer(delivererId);
    } else {
      setLoading(false);
      setShowRegister(true);
    }
    
    fetchRequests();
  }, []);

  const fetchDeliverer = async (id) => {
    try {
      const res = await axios.get(`${API}/deliverers/${id}`);
      setDeliverer(res.data);
      
      // Fetch my deliveries
      const deliveriesRes = await axios.get(`${API}/requests`);
      setMyDeliveries(deliveriesRes.data.filter(r => r.deliverer_id === id));
    } catch (error) {
      console.error("Error fetching deliverer:", error);
      localStorage.removeItem("deliverer_id");
      setShowRegister(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests?status=pending`);
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.name) {
      toast.error("Veuillez entrer votre nom");
      return;
    }
    
    try {
      const res = await axios.post(`${API}/deliverers`, {
        ...registerForm,
        current_location: userLocation || { lat: 4.9372, lng: -52.3267 },
      });
      setDeliverer(res.data);
      localStorage.setItem("deliverer_id", res.data.id);
      setShowRegister(false);
      toast.success("Profil créé avec succès!");
    } catch (error) {
      console.error("Error registering:", error);
      toast.error(t("common.error"));
    }
  };

  const toggleStatus = async () => {
    if (!deliverer) return;
    
    const newStatus = deliverer.status === "available" ? "offline" : "available";
    
    try {
      const res = await axios.patch(`${API}/deliverers/${deliverer.id}`, {
        status: newStatus,
        current_location: userLocation,
      });
      setDeliverer(res.data);
      toast.success(newStatus === "available" ? "Vous êtes maintenant en ligne!" : "Vous êtes hors ligne");
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const announceTrip = async () => {
    if (!tripAnnouncement.trim() || !deliverer) return;
    
    try {
      const res = await axios.patch(`${API}/deliverers/${deliverer.id}`, {
        trip_announcement: tripAnnouncement,
        status: "available",
      });
      setDeliverer(res.data);
      setTripAnnouncement("");
      toast.success("Trajet annoncé!");
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const acceptRequest = async (requestId) => {
    if (!deliverer) return;
    
    try {
      await axios.post(`${API}/requests/${requestId}/accept?deliverer_id=${deliverer.id}`);
      toast.success("Demande acceptée!");
      fetchRequests();
      fetchDeliverer(deliverer.id);
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error(error.response?.data?.detail || t("common.error"));
    }
  };

  const completeDelivery = async (requestId) => {
    try {
      await axios.post(`${API}/requests/${requestId}/complete`);
      toast.success("Livraison terminée!");
      fetchDeliverer(deliverer.id);
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

  // Registration form
  if (showRegister) {
    return (
      <div className="min-h-screen pb-24 p-6" data-testid="deliverer-register-page">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold">{t("home.becomeDeliverer")}</h1>
            <p className="text-muted-foreground mt-2">
              Gagnez de l'argent en aidant vos voisins
            </p>
          </div>
          
          <div className="card p-6 space-y-4">
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Jean Dupont"
                className="form-input mt-2"
                data-testid="register-name"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+594 6 94 XX XX XX"
                className="form-input mt-2"
                data-testid="register-phone"
              />
            </div>
            
            <div>
              <Label>Type de véhicule</Label>
              <Select
                value={registerForm.vehicle_type}
                onValueChange={(value) => setRegisterForm(prev => ({ ...prev, vehicle_type: value }))}
              >
                <SelectTrigger className="mt-2" data-testid="register-vehicle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">{t("vehicle.car")}</SelectItem>
                  <SelectItem value="pickup">{t("vehicle.pickup")}</SelectItem>
                  <SelectItem value="van">{t("vehicle.van")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleRegister}
              className="w-full btn-primary mt-6"
              data-testid="register-submit-btn"
            >
              Créer mon profil livreur
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24" data-testid="deliverer-mode-page">
      {/* Header with status */}
      <header className="p-4 bg-gradient-to-b from-emerald-900 to-emerald-800 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{t("deliverer.title")}</h1>
            <p className="text-emerald-200 text-sm">
              {deliverer?.status === "available" ? "Vous êtes en ligne" : "Vous êtes hors ligne"}
            </p>
          </div>
          
          <button
            onClick={toggleStatus}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              deliverer?.status === "available" 
                ? "bg-emerald-400 text-emerald-900" 
                : "bg-stone-600 text-stone-300"
            }`}
            data-testid="toggle-status-btn"
          >
            <Power className="w-6 h-6" />
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{deliverer?.total_deliveries || 0}</p>
            <p className="text-xs text-emerald-200">Livraisons</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <p className="text-2xl font-bold">{deliverer?.rating?.toFixed(1) || "5.0"}</p>
            </div>
            <p className="text-xs text-emerald-200">Note</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{myDeliveries.filter(d => d.status === "completed").length}</p>
            <p className="text-xs text-emerald-200">Terminées</p>
          </div>
        </div>
      </header>

      {/* Trip Announcement */}
      {deliverer?.status === "available" && (
        <div className="p-4">
          <div className="card p-4">
            <Label className="mb-2 block">{t("deliverer.announceTrip")}</Label>
            <div className="flex gap-2">
              <Input
                value={tripAnnouncement}
                onChange={(e) => setTripAnnouncement(e.target.value)}
                placeholder={t("deliverer.tripPlaceholder")}
                className="form-input"
                data-testid="trip-announcement-input"
              />
              <Button onClick={announceTrip} className="btn-primary px-4" data-testid="announce-trip-btn">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
            
            {deliverer?.trip_announcement && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {deliverer.trip_announcement}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="px-4">
        <Map
          requests={requests}
          userLocation={userLocation}
          className="h-[200px]"
        />
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="available">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="available" className="flex-1" data-testid="tab-available">
              {t("deliverer.availableRequests")} ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="mine" className="flex-1" data-testid="tab-mine">
              {t("deliverer.myDeliveries")} ({myDeliveries.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-3">
            {requests.length > 0 ? (
              requests.map((request) => (
                <RequestCard 
                  key={request.id} 
                  request={request} 
                  showActions={deliverer?.status === "available"}
                  onAccept={acceptRequest}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune demande disponible
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mine" className="space-y-3">
            {myDeliveries.length > 0 ? (
              myDeliveries.map((delivery) => (
                <div key={delivery.id} className="card p-4">
                  <RequestCard request={delivery} />
                  
                  {delivery.status === "accepted" && (
                    <Button
                      onClick={() => completeDelivery(delivery.id)}
                      className="w-full btn-primary mt-4"
                      data-testid={`complete-delivery-${delivery.id}`}
                    >
                      Marquer comme terminée
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune livraison en cours
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
