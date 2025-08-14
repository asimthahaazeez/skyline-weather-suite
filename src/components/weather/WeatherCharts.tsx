import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeatherForecast } from '@/types/weather';
import { formatTime, formatTemperature } from '@/lib/weather-utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Droplets, 
  Wind, 
  Gauge,
  Navigation
} from 'lucide-react';

interface WeatherChartsProps {
  forecast: WeatherForecast;
}

const WeatherCharts: React.FC<WeatherChartsProps> = ({ forecast }) => {
  // Prepare data for different charts
  const temperatureData = forecast.list.slice(0, 24).map(item => ({
    time: formatTime(item.dt),
    temperature: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    timestamp: item.dt
  }));

  const precipitationData = forecast.list.slice(0, 24).map(item => ({
    time: formatTime(item.dt),
    precipitation: Math.round(item.pop * 100),
    rain: item.rain?.['3h'] || 0,
    snow: item.snow?.['3h'] || 0,
    timestamp: item.dt
  }));

  const windData = forecast.list.slice(0, 24).map(item => ({
    time: formatTime(item.dt),
    speed: Math.round(item.wind.speed * 10) / 10,
    gust: item.wind.gust ? Math.round(item.wind.gust * 10) / 10 : 0,
    direction: item.wind.deg,
    timestamp: item.dt
  }));

  const pressureData = forecast.list.slice(0, 24).map(item => ({
    time: formatTime(item.dt),
    pressure: item.main.pressure,
    timestamp: item.dt
  }));

  // Wind direction distribution
  const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const windDistribution = windDirections.map(direction => {
    const count = windData.filter(item => {
      const dirIndex = Math.round(item.direction / 45) % 8;
      return windDirections[dirIndex] === direction;
    }).length;
    return {
      direction,
      count,
      percentage: Math.round((count / windData.length) * 100)
    };
  });

  const COLORS = ['hsl(217, 91%, 60%)', 'hsl(25, 95%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(45, 93%, 47%)'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-weather border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Weather Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="temperature" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="temperature" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">Temperature</span>
            </TabsTrigger>
            <TabsTrigger value="precipitation" className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              <span className="hidden sm:inline">Precipitation</span>
            </TabsTrigger>
            <TabsTrigger value="wind" className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              <span className="hidden sm:inline">Wind</span>
            </TabsTrigger>
            <TabsTrigger value="pressure" className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              <span className="hidden sm:inline">Pressure</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temperature" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temperatureData}>
                  <defs>
                    <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="feelsLikeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    unit="°C"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke="hsl(217, 91%, 60%)"
                    fillOpacity={1}
                    fill="url(#temperatureGradient)"
                    name="Temperature"
                    unit="°C"
                  />
                  <Area
                    type="monotone"
                    dataKey="feelsLike"
                    stroke="hsl(25, 95%, 53%)"
                    fillOpacity={1}
                    fill="url(#feelsLikeGradient)"
                    name="Feels Like"
                    unit="°C"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="precipitation" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={precipitationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    unit="%"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="precipitation"
                    fill="hsl(217, 91%, 60%)"
                    radius={[4, 4, 0, 0]}
                    name="Chance of Rain"
                    unit="%"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="wind" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Wind className="h-4 w-4" />
                  Wind Speed Trends
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={windData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      unit=" m/s"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="speed"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(217, 91%, 60%)', strokeWidth: 2, r: 4 }}
                      name="Wind Speed"
                      unit=" m/s"
                    />
                    <Line
                      type="monotone"
                      dataKey="gust"
                      stroke="hsl(25, 95%, 53%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: 'hsl(25, 95%, 53%)', strokeWidth: 2, r: 4 }}
                      name="Gusts"
                      unit=" m/s"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-64">
                <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Wind Direction Distribution
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={windDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ direction, percentage }) => `${direction} ${percentage}%`}
                      labelLine={false}
                    >
                      {windDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${props.payload.count} occurrences (${props.payload.percentage}%)`,
                        props.payload.direction
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pressure" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pressureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    unit=" hPa"
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="pressure"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 5 }}
                    name="Atmospheric Pressure"
                    unit=" hPa"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WeatherCharts;