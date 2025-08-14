import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeatherAPI } from '@/lib/weather-api';
import { getCurrentLocation } from '@/lib/weather-utils';
import { LocationData } from '@/types/weather';
import { 
  Search, 
  MapPin, 
  Loader2, 
  Navigation,
  Star,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationSearchProps {
  apiKey: string;
  onLocationSelect: (location: { lat: number; lon: number; name: string }) => void;
  currentLocation?: { lat: number; lon: number; name: string };
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  apiKey, 
  onLocationSelect, 
  currentLocation 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [savedLocations, setSavedLocations] = useState<LocationData[]>(() => {
    const saved = localStorage.getItem('saved_weather_locations');
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();

  const weatherAPI = new WeatherAPI(apiKey);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await weatherAPI.searchLocations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for locations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, weatherAPI, toast]);

  const handleLocationClick = (location: LocationData) => {
    onLocationSelect({
      lat: location.lat,
      lon: location.lon,
      name: `${location.name}, ${location.country}`
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      
      const locationData = await weatherAPI.getLocationByCoords(latitude, longitude);
      if (locationData.length > 0) {
        const location = locationData[0];
        onLocationSelect({
          lat: latitude,
          lon: longitude,
          name: `${location.name}, ${location.country}`
        });
      } else {
        onLocationSelect({
          lat: latitude,
          lon: longitude,
          name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
        });
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      toast({
        title: "Location Error",
        description: "Failed to get your current location. Please enable location services.",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSaveLocation = (location: LocationData) => {
    const isAlreadySaved = savedLocations.some(
      saved => saved.lat === location.lat && saved.lon === location.lon
    );
    
    if (!isAlreadySaved) {
      const newSavedLocations = [...savedLocations, location];
      setSavedLocations(newSavedLocations);
      localStorage.setItem('saved_weather_locations', JSON.stringify(newSavedLocations));
      toast({
        title: "Location Saved",
        description: `${location.name}, ${location.country} has been saved to your favorites.`,
      });
    }
  };

  const handleRemoveSavedLocation = (location: LocationData) => {
    const newSavedLocations = savedLocations.filter(
      saved => !(saved.lat === location.lat && saved.lon === location.lon)
    );
    setSavedLocations(newSavedLocations);
    localStorage.setItem('saved_weather_locations', JSON.stringify(newSavedLocations));
  };

  return (
    <Card className="shadow-weather border-border/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 transition-smooth focus:shadow-glow-primary"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="bg-gradient-sky hover:shadow-glow-primary transition-smooth"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleCurrentLocation}
            disabled={isGettingLocation}
            className="w-full hover:bg-muted transition-smooth"
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Navigation className="h-4 w-4 mr-2" />
            )}
            Use Current Location
          </Button>

          {currentLocation && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Current: {currentLocation.name}</span>
              </div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Search Results</h4>
              {searchResults.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth cursor-pointer"
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {location.name}, {location.state ? `${location.state}, ` : ''}{location.country}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveLocation(location);
                    }}
                    className="h-8 w-8 p-0 hover:bg-accent"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {savedLocations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Saved Locations</h4>
              {savedLocations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth cursor-pointer"
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent fill-accent" />
                    <span className="text-sm">
                      {location.name}, {location.state ? `${location.state}, ` : ''}{location.country}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSavedLocation(location);
                    }}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSearch;