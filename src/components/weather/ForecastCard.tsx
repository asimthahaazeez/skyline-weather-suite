import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeatherForecast, ForecastItem } from '@/types/weather';
import { 
  formatTemperature, 
  formatTime, 
  formatDate, 
  getWeatherIcon 
} from '@/lib/weather-utils';
import { 
  Calendar, 
  Clock, 
  Droplets, 
  Wind 
} from 'lucide-react';

interface ForecastCardProps {
  forecast: WeatherForecast;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  // Group forecast by day
  const dailyForecasts = forecast.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ForecastItem[]>);

  const days = Object.keys(dailyForecasts).slice(0, 5);

  const renderHourlyForecast = (items: ForecastItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.dt}
          className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {formatTime(item.dt)}
            </span>
            <img
              src={getWeatherIcon(item.weather[0].icon)}
              alt={item.weather[0].description}
              className="h-8 w-8"
            />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">
              {formatTemperature(item.main.temp)}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {item.weather[0].description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Droplets className="h-3 w-3" />
              <span>{Math.round(item.pop * 100)}%</span>
              <Wind className="h-3 w-3 ml-1" />
              <span>{item.wind.speed.toFixed(1)} m/s</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDailyOverview = () => (
    <div className="space-y-3">
      {days.map((day) => {
        const dayItems = dailyForecasts[day];
        const temps = dayItems.map(item => item.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const avgPop = dayItems.reduce((sum, item) => sum + item.pop, 0) / dayItems.length;
        const mainCondition = dayItems[Math.floor(dayItems.length / 2)].weather[0];

        return (
          <div
            key={day}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
          >
            <div className="flex items-center gap-4">
              <img
                src={getWeatherIcon(mainCondition.icon)}
                alt={mainCondition.description}
                className="h-10 w-10"
              />
              <div>
                <p className="font-medium">{formatDate(dayItems[0].dt)}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {mainCondition.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {formatTemperature(maxTemp)} / {formatTemperature(minTemp)}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Droplets className="h-3 w-3" />
                <span>{Math.round(avgPop * 100)}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card className="shadow-weather border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          5-Day Weather Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Overview
            </TabsTrigger>
            <TabsTrigger value="hourly" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hourly Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-6">
            {renderDailyOverview()}
          </TabsContent>
          
          <TabsContent value="hourly" className="mt-6">
            <Tabs defaultValue={days[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {days.map((day) => (
                  <TabsTrigger key={day} value={day} className="text-xs">
                    {formatDate(dailyForecasts[day][0].dt).split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {days.map((day) => (
                <TabsContent key={day} value={day} className="mt-4">
                  {renderHourlyForecast(dailyForecasts[day])}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ForecastCard;