import { useState, useEffect } from "react";
import { Globe, ChevronDown, Search, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

// Countries with coordinates for map centering
const countries = [
  // Europe
  { code: "FR", name: "France", flag: "🇫🇷", lat: 46.2276, lng: 2.2137, zoom: 6 },
  { code: "GF", name: "Guyane Française", flag: "🇬🇫", lat: 4.0, lng: -53.0, zoom: 7 },
  { code: "GP", name: "Guadeloupe", flag: "🇬🇵", lat: 16.265, lng: -61.551, zoom: 10 },
  { code: "MQ", name: "Martinique", flag: "🇲🇶", lat: 14.6415, lng: -61.0242, zoom: 10 },
  { code: "RE", name: "La Réunion", flag: "🇷🇪", lat: -21.1151, lng: 55.5364, zoom: 10 },
  { code: "DE", name: "Allemagne", flag: "🇩🇪", lat: 51.1657, lng: 10.4515, zoom: 6 },
  { code: "ES", name: "Espagne", flag: "🇪🇸", lat: 40.4637, lng: -3.7492, zoom: 6 },
  { code: "IT", name: "Italie", flag: "🇮🇹", lat: 41.8719, lng: 12.5674, zoom: 6 },
  { code: "PT", name: "Portugal", flag: "🇵🇹", lat: 39.3999, lng: -8.2245, zoom: 7 },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧", lat: 55.3781, lng: -3.436, zoom: 6 },
  { code: "BE", name: "Belgique", flag: "🇧🇪", lat: 50.5039, lng: 4.4699, zoom: 8 },
  { code: "CH", name: "Suisse", flag: "🇨🇭", lat: 46.8182, lng: 8.2275, zoom: 8 },
  { code: "NL", name: "Pays-Bas", flag: "🇳🇱", lat: 52.1326, lng: 5.2913, zoom: 8 },
  
  // Africa
  { code: "SN", name: "Sénégal", flag: "🇸🇳", lat: 14.4974, lng: -14.4524, zoom: 7 },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", lat: 7.54, lng: -5.5471, zoom: 7 },
  { code: "CM", name: "Cameroun", flag: "🇨🇲", lat: 7.3697, lng: 12.3547, zoom: 6 },
  { code: "MA", name: "Maroc", flag: "🇲🇦", lat: 31.7917, lng: -7.0926, zoom: 6 },
  { code: "TN", name: "Tunisie", flag: "🇹🇳", lat: 33.8869, lng: 9.5375, zoom: 7 },
  { code: "DZ", name: "Algérie", flag: "🇩🇿", lat: 28.0339, lng: 1.6596, zoom: 5 },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", lat: -18.7669, lng: 46.8691, zoom: 6 },
  { code: "MU", name: "Maurice", flag: "🇲🇺", lat: -20.3484, lng: 57.5522, zoom: 10 },
  { code: "GA", name: "Gabon", flag: "🇬🇦", lat: -0.8037, lng: 11.6094, zoom: 7 },
  { code: "CG", name: "Congo", flag: "🇨🇬", lat: -0.228, lng: 15.8277, zoom: 6 },
  { code: "CD", name: "RD Congo", flag: "🇨🇩", lat: -4.0383, lng: 21.7587, zoom: 5 },
  
  // Americas
  { code: "US", name: "États-Unis", flag: "🇺🇸", lat: 37.0902, lng: -95.7129, zoom: 4 },
  { code: "CA", name: "Canada", flag: "🇨🇦", lat: 56.1304, lng: -106.3468, zoom: 4 },
  { code: "MX", name: "Mexique", flag: "🇲🇽", lat: 23.6345, lng: -102.5528, zoom: 5 },
  { code: "BR", name: "Brésil", flag: "🇧🇷", lat: -14.235, lng: -51.9253, zoom: 4 },
  { code: "AR", name: "Argentine", flag: "🇦🇷", lat: -38.4161, lng: -63.6167, zoom: 4 },
  { code: "CO", name: "Colombie", flag: "🇨🇴", lat: 4.5709, lng: -74.2973, zoom: 6 },
  { code: "PE", name: "Pérou", flag: "🇵🇪", lat: -9.19, lng: -75.0152, zoom: 6 },
  { code: "CL", name: "Chili", flag: "🇨🇱", lat: -35.6751, lng: -71.543, zoom: 5 },
  { code: "HT", name: "Haïti", flag: "🇭🇹", lat: 18.9712, lng: -72.2852, zoom: 8 },
  { code: "SR", name: "Suriname", flag: "🇸🇷", lat: 3.9193, lng: -56.0278, zoom: 7 },
  
  // Asia & Middle East
  { code: "CN", name: "Chine", flag: "🇨🇳", lat: 35.8617, lng: 104.1954, zoom: 4 },
  { code: "JP", name: "Japon", flag: "🇯🇵", lat: 36.2048, lng: 138.2529, zoom: 5 },
  { code: "KR", name: "Corée du Sud", flag: "🇰🇷", lat: 35.9078, lng: 127.7669, zoom: 7 },
  { code: "IN", name: "Inde", flag: "🇮🇳", lat: 20.5937, lng: 78.9629, zoom: 5 },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", lat: 14.0583, lng: 108.2772, zoom: 6 },
  { code: "TH", name: "Thaïlande", flag: "🇹🇭", lat: 15.87, lng: 100.9925, zoom: 6 },
  { code: "PH", name: "Philippines", flag: "🇵🇭", lat: 12.8797, lng: 121.774, zoom: 6 },
  { code: "ID", name: "Indonésie", flag: "🇮🇩", lat: -0.7893, lng: 113.9213, zoom: 5 },
  { code: "AE", name: "Émirats Arabes Unis", flag: "🇦🇪", lat: 23.4241, lng: 53.8478, zoom: 7 },
  { code: "SA", name: "Arabie Saoudite", flag: "🇸🇦", lat: 23.8859, lng: 45.0792, zoom: 5 },
  { code: "TR", name: "Turquie", flag: "🇹🇷", lat: 38.9637, lng: 35.2433, zoom: 6 },
  { code: "IL", name: "Israël", flag: "🇮🇱", lat: 31.0461, lng: 34.8516, zoom: 8 },
  { code: "LB", name: "Liban", flag: "🇱🇧", lat: 33.8547, lng: 35.8623, zoom: 9 },
  
  // Oceania
  { code: "AU", name: "Australie", flag: "🇦🇺", lat: -25.2744, lng: 133.7751, zoom: 4 },
  { code: "NZ", name: "Nouvelle-Zélande", flag: "🇳🇿", lat: -40.9006, lng: 174.886, zoom: 5 },
  { code: "NC", name: "Nouvelle-Calédonie", flag: "🇳🇨", lat: -20.9043, lng: 165.618, zoom: 8 },
  { code: "PF", name: "Polynésie Française", flag: "🇵🇫", lat: -17.6797, lng: -149.4068, zoom: 8 },
];

export default function CountrySelector({ selectedCountry, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentCountry = countries.find(c => c.code === selectedCountry) || countries[1]; // Default to GF

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white"
        data-testid="country-selector-btn"
      >
        <span className="text-xl">{currentCountry.flag}</span>
        <span className="font-medium">{currentCountry.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Choisir votre pays
            </DialogTitle>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un pays..."
              className="pl-10"
              data-testid="country-search"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onSelect(country);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    selectedCountry === country.code
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                  data-testid={`country-${country.code}`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                  {selectedCountry === country.code && (
                    <MapPin className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { countries };
