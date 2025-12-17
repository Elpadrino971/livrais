import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Package, ShoppingCart, Truck, Users, Clock, Map as MapIcon } from "lucide-react";
import Map from "../components/Map";
import AddressSearch from "../components/AddressSearch";
import PhotoUpload from "../components/PhotoUpload";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const requestTypes = [
  { value: "heavy", icon: Package, label: "request.heavy" },
  { value: "groceries", icon: ShoppingCart, label: "request.groceries" },
  { value: "transport", icon: Truck, label: "request.transport" },
];

const vehicleTypes = [
  { value: "car", label: "vehicle.car" },
  { value: "pickup", label: "vehicle.pickup" },
  { value: "van", label: "vehicle.van" },
];

export default function CreateRequestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState(1); // 1: Type, 2: Locations, 3: Details
  const [loading, setLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [selectingLocation, setSelectingLocation] = useState(null); // "pickup" or "dropoff"
  
  const [formData, setFormData] = useState({
    request_type: searchParams.get("type") || "",
    title: "",
    description: "",
    pickup_location: null,
    dropoff_location: null,
    product_type: "",
    proposed_price: "",
    desired_time: "",
    vehicle_type: "",
    needs_helper: false,
    client_name: "",
    client_phone: "",
  });

  useEffect(() => {
    if (formData.pickup_location && formData.dropoff_location && formData.request_type) {
      estimatePrice();
    }
  }, [formData.pickup_location, formData.dropoff_location, formData.request_type, formData.needs_helper]);

  const estimatePrice = async () => {
    try {
      const res = await axios.post(`${API}/estimate-price`, {
        pickup: formData.pickup_location,
        dropoff: formData.dropoff_location,
        request_type: formData.request_type,
        needs_helper: formData.needs_helper,
      });
      setEstimatedPrice(res.data);
      if (!formData.proposed_price) {
        setFormData(prev => ({ ...prev, proposed_price: res.data.estimated_price.toString() }));
      }
    } catch (error) {
      console.error("Error estimating price:", error);
    }
  };

  const handleLocationSelect = (location) => {
    if (selectingLocation === "pickup") {
      setFormData(prev => ({ ...prev, pickup_location: { ...location, address: location.address || "Point de départ" } }));
    } else if (selectingLocation === "dropoff") {
      setFormData(prev => ({ ...prev, dropoff_location: { ...location, address: location.address || "Point d'arrivée" } }));
    }
    setSelectingLocation(null);
  };

  const handlePickupAddressSelect = (location) => {
    if (location) {
      setFormData(prev => ({ ...prev, pickup_location: location }));
    } else {
      setFormData(prev => ({ ...prev, pickup_location: null }));
    }
  };

  const handleDropoffAddressSelect = (location) => {
    if (location) {
      setFormData(prev => ({ ...prev, dropoff_location: location }));
    } else {
      setFormData(prev => ({ ...prev, dropoff_location: null }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.request_type || !formData.title || !formData.pickup_location || 
        !formData.dropoff_location || !formData.proposed_price || !formData.client_name) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/requests`, formData);
      toast.success(t("create.success"));
      navigate(`/request/${res.data.id}`);
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24" data-testid="create-request-page">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="p-2 -ml-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-lg">{t("create.title")}</h1>
            <p className="text-sm text-muted-foreground">Étape {step}/3</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Step 1: Request Type */}
      {step === 1 && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div>
            <Label className="text-base font-medium mb-4 block">{t("create.selectType")}</Label>
            <div className="space-y-3">
              {requestTypes.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, request_type: value }));
                    setStep(2);
                  }}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-colors duration-200 ${
                    formData.request_type === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`select-type-${value}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{t(label)}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(`request.${value}Desc`)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Locations */}
      {step === 2 && (
        <div className="animate-fade-in">
          <div className="p-4 space-y-4">
            {/* Pickup Location */}
            <div>
              <Label className="mb-2 block flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {t("create.pickup")} *
              </Label>
              <AddressSearch
                onSelect={handlePickupAddressSelect}
                placeholder="Rechercher l'adresse de départ..."
                value={formData.pickup_location}
                data-testid="pickup-address-search"
              />
              <button
                onClick={() => setSelectingLocation("pickup")}
                className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                data-testid="select-pickup-map-btn"
              >
                <MapIcon className="w-4 h-4" />
                Ou pointer sur la carte
              </button>
            </div>
            
            {/* Dropoff Location */}
            <div>
              <Label className="mb-2 block flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                {t("create.dropoff")} *
              </Label>
              <AddressSearch
                onSelect={handleDropoffAddressSelect}
                placeholder="Rechercher l'adresse d'arrivée..."
                value={formData.dropoff_location}
                data-testid="dropoff-address-search"
              />
              <button
                onClick={() => setSelectingLocation("dropoff")}
                className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                data-testid="select-dropoff-map-btn"
              >
                <MapIcon className="w-4 h-4" />
                Ou pointer sur la carte
              </button>
            </div>

            {selectingLocation && (
              <div className="p-3 bg-primary/10 rounded-xl text-center">
                <p className="text-sm text-primary font-medium animate-pulse-soft">
                  Cliquez sur la carte pour sélectionner {selectingLocation === "pickup" ? "le départ" : "l'arrivée"}
                </p>
              </div>
            )}
          </div>

          <div className="px-4">
            <Map
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectingLocation === "pickup" ? formData.pickup_location : formData.dropoff_location}
              className="h-[250px]"
            />
          </div>

          {estimatedPrice && (
            <div className="mx-4 mt-4 p-4 card bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-muted-foreground">{t("create.estimatedPrice")}</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {estimatedPrice.estimated_price}€
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Distance: {estimatedPrice.distance_km} km
              </p>
            </div>
          )}

          <div className="p-4">
            <Button
              onClick={() => setStep(3)}
              disabled={!formData.pickup_location || !formData.dropoff_location}
              className="w-full btn-primary"
              data-testid="continue-to-details-btn"
            >
              Continuer
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div>
            <Label htmlFor="title">{t("create.requestTitle")} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Livraison d'un réfrigérateur"
              className="form-input mt-2"
              data-testid="input-title"
            />
          </div>

          <div>
            <Label htmlFor="description">{t("create.description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Détails supplémentaires..."
              className="form-input mt-2 min-h-[100px]"
              data-testid="input-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">{t("create.price")} (€) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.proposed_price}
                onChange={(e) => setFormData(prev => ({ ...prev, proposed_price: e.target.value }))}
                placeholder="20"
                className="form-input mt-2"
                data-testid="input-price"
              />
            </div>
            
            <div>
              <Label htmlFor="time">{t("create.desiredTime")}</Label>
              <Input
                id="time"
                type="time"
                value={formData.desired_time}
                onChange={(e) => setFormData(prev => ({ ...prev, desired_time: e.target.value }))}
                className="form-input mt-2"
                data-testid="input-time"
              />
            </div>
          </div>

          <div>
            <Label>{t("create.vehicleType")}</Label>
            <Select
              value={formData.vehicle_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_type: value }))}
            >
              <SelectTrigger className="mt-2" data-testid="select-vehicle">
                <SelectValue placeholder={t("vehicle.any")} />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {t(label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 dark:bg-stone-800">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t("create.needsHelper")}</p>
                <p className="text-sm text-muted-foreground">+50% sur le prix</p>
              </div>
            </div>
            <Switch
              checked={formData.needs_helper}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, needs_helper: checked }))}
              data-testid="switch-helper"
            />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="font-medium mb-4">Vos coordonnées</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t("create.yourName")} *</Label>
                <Input
                  id="name"
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Jean Dupont"
                  className="form-input mt-2"
                  data-testid="input-name"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">{t("create.yourPhone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.client_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                  placeholder="+594 6 94 XX XX XX"
                  className="form-input mt-2"
                  data-testid="input-phone"
                />
              </div>
            </div>
          </div>

          {estimatedPrice && (
            <div className="p-4 card bg-stone-50 dark:bg-stone-800">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("payment.total")}</span>
                <span className="text-2xl font-bold">{formData.proposed_price || estimatedPrice.estimated_price}€</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Commission plateforme: {(parseFloat(formData.proposed_price || estimatedPrice.estimated_price) * 0.15).toFixed(2)}€
              </p>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.client_name || !formData.proposed_price}
            className="w-full btn-primary"
            data-testid="submit-request-btn"
          >
            {loading ? t("common.loading") : t("create.submit")}
          </Button>
        </div>
      )}
    </div>
  );
}
