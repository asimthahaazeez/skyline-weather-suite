import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CurrentWeather } from '@/types/weather';
import { 
  formatTemperature, 
  formatTime, 
  getWeatherIcon, 
  getWeatherAnimation,
  getComfortIndex 
} from '@/lib/weather-utils';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Eye, 
  Wind, 
  Sunrise, 
  Sunset,
  MapPin
} from 'lucide-react';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
}

const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ weather }) => {
  const currentCondition = weather.weather[0];
  const comfort = getComfortIndex(weather.main.temp, weather.main.humidity);
  const isNight = Date.now() / 1000 > weather.sys.sunset || Date.now() / 1000 < weather.sys.sunrise;

  return (
    <Card className="shadow-weather border-border/50 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{weather.name}, {weather.sys.country}</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-1">
              {formatTemperature(weather.main.temp)}
            </h2>
            <p className="text-muted-foreground capitalize">
              {currentCondition.description}
            </p>
            <p className="text-sm text-muted-foreground">
              Feels like {formatTemperature(weather.main.feels_like)}
            </p>
          </div>
          <div className="text-right">
            <img
              src={getWeatherIcon(currentCondition.icon, true)}
              alt={currentCondition.description}
              className={`h-16 w-16 ${getWeatherAnimation(currentCondition)}`}
            />
            <Badge variant="secondary" className="mt-2">
              {currentCondition.main}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Min/Max</p>
              <p className="text-sm font-medium">
                {formatTemperature(weather.main.temp_min)}/{formatTemperature(weather.main.temp_max)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="text-sm font-medium">{weather.main.humidity}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Pressure</p>
              <p className="text-sm font-medium">{weather.main.pressure} hPa</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="text-sm font-medium">{(weather.visibility / 1000).toFixed(1)} km</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Wind className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="text-sm font-medium">
                {weather.wind.speed.toFixed(1)} m/s
                {weather.wind.gust && ` (${weather.wind.gust.toFixed(1)} m/s gusts)`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Sunrise className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Sunrise</p>
              <p className="text-sm font-medium">
                {formatTime(weather.sys.sunrise, weather.timezone)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Sunset className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Sunset</p>
              <p className="text-sm font-medium">
                {formatTime(weather.sys.sunset, weather.timezone)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Comfort Level</span>
            <Badge variant="secondary" className={comfort.color}>
              {comfort.level}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{comfort.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentWeatherCard;