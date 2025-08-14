import React, { useState, useEffect } from 'react';
import { WeatherAPI, getStoredApiKey, removeApiKey } from '@/lib/weather-api';
import { CurrentWeather, WeatherForecast } from '@/types/weather';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ApiKeyInput from './ApiKeyInput';
import CurrentWeatherCard from './CurrentWeatherCard';
import ForecastCard from './ForecastCard';
import LocationSearch from './LocationSearch';
import WeatherCharts from './WeatherCharts';
import { 
  Settings, 
  RefreshCw, 
  Loader2,
  LogOut 
} from 'lucide-react';

const WeatherDashboard: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lon: number; name: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = getStoredApiKey();
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    if (apiKey && currentLocation) {
      loadWeatherData();
    }
  }, [apiKey, currentLocation]);

  const saveWeatherSearch = async (weatherData: CurrentWeather, uvIndex: number | null = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, skipping weather search save');
        return;
      }

      await supabase.from('weather_searches').insert({
        user_id: user.id,
        location_name: currentLocation?.name || weatherData.name,
        latitude: weatherData.coord.lat,
        longitude: weatherData.coord.lon,
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        weather_description: weatherData.weather[0].description,
        weather_icon: weatherData.weather[0].icon,
        feels_like: weatherData.main.feels_like,
        wind_speed: weatherData.wind.speed,
        visibility: weatherData.visibility,
        uv_index: uvIndex
      });
    } catch (error) {
      console.error('Error saving weather search:', error);
    }
  };

  const loadWeatherData = async () => {
    if (!apiKey || !currentLocation) return;

    setIsLoading(true);
    try {
      const weatherAPI = new WeatherAPI(apiKey);
      
      const [weatherData, forecastData, uvData] = await Promise.all([
        weatherAPI.getCurrentWeather(currentLocation.lat, currentLocation.lon),
        weatherAPI.getForecast(currentLocation.lat, currentLocation.lon),
        weatherAPI.getUVIndex(currentLocation.lat, currentLocation.lon).catch(() => null)
      ]);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
      
      // Save weather search to database
      await saveWeatherSearch(weatherData, uvData?.value || null);
      
      toast({
        title: "Weather Updated",
        description: `Weather data loaded for ${currentLocation.name}`,
      });
    } catch (error) {
      console.error('Error loading weather data:', error);
      toast({
        title: "Error Loading Weather",
        description: "Failed to load weather data. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  const handleLocationSelect = (location: {lat: number; lon: number; name: string}) => {
    setCurrentLocation(location);
  };

  const handleRefresh = () => {
    loadWeatherData();
  };

  const handleLogout = () => {
    removeApiKey();
    setApiKey(null);
    setCurrentWeather(null);
    setForecast(null);
    setCurrentLocation(null);
  };

  if (!apiKey) {
    return <ApiKeyInput onApiKeySet={handleApiKeySet} />;
  }

  return (
    <div className="min-h-screen bg-gradient-atmospheric">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-sky bg-clip-text text-transparent">
            Weather Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || !currentLocation}
              className="hover:bg-muted transition-smooth"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive transition-smooth"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Location Search Sidebar */}
          <div className="lg:col-span-1">
            <LocationSearch 
              apiKey={apiKey}
              onLocationSelect={handleLocationSelect}
              currentLocation={currentLocation}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {currentWeather && (
              <CurrentWeatherCard weather={currentWeather} />
            )}

            {forecast && (
              <>
                <ForecastCard forecast={forecast} />
                <WeatherCharts forecast={forecast} />
              </>
            )}

            {!currentLocation && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-sky rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
                  <Settings className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Welcome to Weather Dashboard
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Search for a location or use your current location to get started with comprehensive weather data and forecasts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;