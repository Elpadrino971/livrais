import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Input } from "./ui/input";

export default function AddressSearch({ 
  onSelect, 
  placeholder = "Rechercher une adresse...",
  value = null,
  className = ""
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(value?.address || "");
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update selected address when value prop changes
  useEffect(() => {
    if (value?.address) {
      setSelectedAddress(value.address);
    }
  }, [value]);

  const searchAddress = async (searchQuery) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Use OpenStreetMap Nominatim API (free, no key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=gf,fr&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'fr'
          }
        }
      );
      const data = await response.json();
      
      setResults(data.map(item => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name,
        shortAddress: formatShortAddress(item),
        type: item.type
      })));
      setShowResults(true);
    } catch (error) {
      console.error("Error searching address:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatShortAddress = (item) => {
    const parts = [];
    if (item.address) {
      if (item.address.road) parts.push(item.address.road);
      if (item.address.house_number) parts.unshift(item.address.house_number);
      if (item.address.city || item.address.town || item.address.village) {
        parts.push(item.address.city || item.address.town || item.address.village);
      }
    }
    return parts.length > 0 ? parts.join(", ") : item.display_name.split(",")[0];
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedAddress("");
    
    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  const handleSelect = (result) => {
    setSelectedAddress(result.shortAddress);
    setQuery("");
    setShowResults(false);
    setResults([]);
    
    onSelect({
      lat: result.lat,
      lng: result.lng,
      address: result.shortAddress
    });
  };

  const handleClear = () => {
    setQuery("");
    setSelectedAddress("");
    setResults([]);
    onSelect(null);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        
        {selectedAddress ? (
          <div 
            className="w-full h-12 px-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center"
            data-testid="selected-address"
          >
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <span className="text-emerald-800 dark:text-emerald-300 truncate flex-1">
              {selectedAddress}
            </span>
            <button
              onClick={handleClear}
              className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded-full transition-colors"
              data-testid="clear-address"
            >
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        ) : (
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 rounded-xl bg-stone-50 dark:bg-stone-800 border-transparent focus:border-primary"
            data-testid="address-search-input"
          />
        )}
        
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-stone-900 rounded-xl border border-border shadow-lg overflow-hidden animate-fade-in">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800 flex items-start gap-3 border-b border-border last:border-0 transition-colors"
              data-testid={`address-result-${index}`}
            >
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">
                  {result.shortAddress}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {result.address}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showResults && query.length >= 3 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-stone-900 rounded-xl border border-border shadow-lg p-4 text-center text-muted-foreground">
          Aucune adresse trouvée
        </div>
      )}
    </div>
  );
}
