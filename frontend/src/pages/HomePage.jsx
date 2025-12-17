import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Plus, Truck, Package, ShoppingCart, ArrowRight } from "lucide-react";
import Map from "../components/Map";
import RequestCard from "../components/RequestCard";
import DelivererCard from "../components/DelivererCard";
import NotificationBell from "../components/NotificationBell";
import CountrySelector, { countries } from "../components/CountrySelector";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const { t } = useTranslation();
  const [deliverers, setDeliverers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem("selectedCountry") || "GF";
  });
  const [mapCenter, setMapCenter] = useState([4.0, -53.0]);
  const [mapZoom, setMapZoom] = useState(7);

  useEffect(() => {
    // Set map center based on selected country
    const country = countries.find(c => c.code === selectedCountry);
    if (country) {
      setMapCenter([country.lat, country.lng]);
      setMapZoom(country.zoom);
    }
  }, [selectedCountry]);

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
          // Use country center if geolocation fails
          const country = countries.find(c => c.code === selectedCountry);
          if (country) {
            setUserLocation({ lat: country.lat, lng: country.lng });
          }
        }
      );
    }
    
    fetchData();
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country.code);
    localStorage.setItem("selectedCountry", country.code);
    setMapCenter([country.lat, country.lng]);
    setMapZoom(country.zoom);
  };

  const fetchData = async () => {
    try {
      const [deliverersRes, requestsRes] = await Promise.all([
        axios.get(`${API}/deliverers?status=available`),
        axios.get(`${API}/requests?status=pending`),
      ]);
      setDeliverers(deliverersRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestTypes = [
    {
      type: "heavy",
      icon: Package,
      title: t("request.heavy"),
      desc: t("request.heavyDesc"),
      bg: "from-emerald-500/20 to-emerald-600/10",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      iconColor: "text-emerald-700 dark:text-emerald-400",
    },
    {
      type: "groceries",
      icon: ShoppingCart,
      title: t("request.groceries"),
      desc: t("request.groceriesDesc"),
      bg: "from-amber-500/20 to-amber-600/10",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      iconColor: "text-amber-700 dark:text-amber-400",
    },
    {
      type: "transport",
      icon: Truck,
      title: t("request.transport"),
      desc: t("request.transportDesc"),
      bg: "from-pink-500/20 to-pink-600/10",
      iconBg: "bg-pink-100 dark:bg-pink-900/50",
      iconColor: "text-pink-700 dark:text-pink-400",
    },
  ];

  return (
    <div className="pb-24" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1707009548478-6fbf72bbb6fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwcm9hZCUyMGFlcmlhbHxlbnwwfHx8fDE3NjU5ODM3Mzd8MA&ixlib=rb-4.1.0&q=85)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/90 to-emerald-900/70" />
        
        {/* Notification Bell */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full">
            <NotificationBell />
          </div>
        </div>
        
        <div className="relative px-6 pt-12 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            {t("home.title")}
          </h1>
          <p className="text-emerald-100/80 text-base sm:text-lg mb-6 max-w-md">
            {t("home.subtitle")}
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Link to="/create">
              <Button 
                className="btn-primary bg-white text-emerald-900 hover:bg-emerald-50"
                data-testid="create-request-btn"
              >
                <Plus className="w-5 h-5" />
                {t("home.createRequest")}
              </Button>
            </Link>
            <Link to="/deliverer">
              <Button 
                variant="outline" 
                className="rounded-full px-6 py-4 border-white/30 text-white hover:bg-white/10"
                data-testid="become-deliverer-btn"
              >
                <Truck className="w-5 h-5" />
                {t("home.becomeDeliverer")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="px-4 -mt-4">
        <div className="card-glass p-2">
          <Map
            deliverers={deliverers}
            requests={requests}
            userLocation={userLocation}
            className="h-[300px] sm:h-[400px]"
          />
        </div>
      </section>

      {/* Request Types */}
      <section className="px-4 mt-8">
        <h2 className="text-xl font-semibold mb-4 px-2">{t("create.selectType")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
          {requestTypes.map(({ type, icon: Icon, title, desc, bg, iconBg, iconColor }) => (
            <Link 
              key={type} 
              to={`/create?type=${type}`}
              className="request-type-card group"
              data-testid={`request-type-${type}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${bg} opacity-50`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <ArrowRight className="absolute top-4 right-4 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
          ))}
        </div>
      </section>

      {/* Tabs: Deliverers & Requests */}
      <section className="px-4 mt-8">
        <Tabs defaultValue="deliverers" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="deliverers" className="flex-1" data-testid="tab-deliverers">
              {t("home.nearbyDeliverers")} ({deliverers.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1" data-testid="tab-requests">
              {t("home.activeRequests")} ({requests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deliverers" className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card p-4 h-24 skeleton" />
                ))}
              </div>
            ) : deliverers.length > 0 ? (
              deliverers.slice(0, 5).map((deliverer) => (
                <DelivererCard key={deliverer.id} deliverer={deliverer} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun livreur disponible pour le moment
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card p-4 h-32 skeleton" />
                ))}
              </div>
            ) : requests.length > 0 ? (
              requests.slice(0, 5).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune demande active
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Community Banner */}
      <section className="px-4 mt-8 mb-8">
        <div className="card overflow-hidden">
          <div 
            className="h-32 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1758272133904-413d8755e728?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRpdmVyc2UlMjBwZW9wbGUlMjBjb21tdW5pdHklMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjU5ODM3MjV8MA&ixlib=rb-4.1.0&q=85)`,
            }}
          />
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Rejoignez la communauté</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gagnez de l'argent en aidant vos voisins. Livrez quand vous voulez, où vous voulez.
            </p>
            <Link to="/deliverer">
              <Button className="btn-secondary py-2" data-testid="join-community-btn">
                {t("home.becomeDeliverer")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
