import { WeatherCondition } from '@/types/weather';

export const formatTemperature = (temp: number, unit: 'C' | 'F' = 'C'): string => {
  if (unit === 'F') {
    return `${Math.round(temp * 9/5 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
};

export const formatTime = (timestamp: number, timezone?: number): string => {
  const date = new Date(timestamp * 1000);
  if (timezone) {
    date.setTime(date.getTime() + timezone * 1000);
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString([], { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const getWeatherIcon = (iconCode: string, large: boolean = false): string => {
  const size = large ? '@2x' : '';
  return `https://openweathermap.org/img/w/${iconCode}${size}.png`;
};

export const getWeatherAnimation = (condition: WeatherCondition): string => {
  const main = condition.main.toLowerCase();
  
  switch (main) {
    case 'clear':
      return 'animate-weather-pulse';
    case 'clouds':
      return 'animate-float';
    case 'rain':
    case 'drizzle':
      return 'animate-bounce';
    case 'thunderstorm':
      return 'animate-pulse';
    case 'snow':
      return 'animate-float';
    case 'mist':
    case 'fog':
    case 'haze':
      return 'animate-pulse';
    default:
      return 'animate-weather-pulse';
  }
};

export const getWeatherBackground = (condition: WeatherCondition, isNight: boolean = false): string => {
  const main = condition.main.toLowerCase();
  
  if (isNight) {
    switch (main) {
      case 'clear':
        return 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900';
      case 'clouds':
        return 'bg-gradient-storm';
      case 'rain':
      case 'drizzle':
      case 'thunderstorm':
        return 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900';
      default:
        return 'bg-gradient-atmospheric';
    }
  }
  
  switch (main) {
    case 'clear':
      return 'bg-gradient-sky';
    case 'clouds':
      return 'bg-gradient-to-br from-gray-600 via-blue-700 to-blue-800';
    case 'rain':
    case 'drizzle':
      return 'bg-gradient-to-br from-gray-700 via-blue-800 to-blue-900';
    case 'thunderstorm':
      return 'bg-gradient-storm';
    case 'snow':
      return 'bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400';
    default:
      return 'bg-gradient-sky';
  }
};

export const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

export const getComfortIndex = (temp: number, humidity: number): { level: string; color: string; description: string } => {
  const heatIndex = temp + (0.5 * (temp + 61.0 + ((temp - 68.0) * 1.2) + (humidity * 0.094)));
  
  if (heatIndex < 80) {
    return { level: 'Comfortable', color: 'text-success', description: 'Pleasant conditions' };
  } else if (heatIndex < 90) {
    return { level: 'Caution', color: 'text-warning', description: 'Possible fatigue with prolonged exposure' };
  } else if (heatIndex < 105) {
    return { level: 'Extreme Caution', color: 'text-destructive', description: 'Heat exhaustion possible' };
  } else {
    return { level: 'Danger', color: 'text-destructive', description: 'Heat stroke highly likely' };
  }
};

export const getUVLevel = (uvIndex: number): { level: string; color: string; description: string } => {
  if (uvIndex < 3) {
    return { level: 'Low', color: 'text-success', description: 'Minimal protection required' };
  } else if (uvIndex < 6) {
    return { level: 'Moderate', color: 'text-warning', description: 'Some protection required' };
  } else if (uvIndex < 8) {
    return { level: 'High', color: 'text-destructive', description: 'Protection essential' };
  } else if (uvIndex < 11) {
    return { level: 'Very High', color: 'text-destructive', description: 'Extra protection required' };
  } else {
    return { level: 'Extreme', color: 'text-destructive', description: 'Avoid sun exposure' };
  }
};

export const getAirQualityLevel = (aqi: number): { level: string; color: string; description: string } => {
  switch (aqi) {
    case 1:
      return { level: 'Good', color: 'text-success', description: 'Air quality is satisfactory' };
    case 2:
      return { level: 'Fair', color: 'text-warning', description: 'Acceptable air quality' };
    case 3:
      return { level: 'Moderate', color: 'text-warning', description: 'Sensitive individuals may experience symptoms' };
    case 4:
      return { level: 'Poor', color: 'text-destructive', description: 'Everyone may experience symptoms' };
    case 5:
      return { level: 'Very Poor', color: 'text-destructive', description: 'Health warnings' };
    default:
      return { level: 'Unknown', color: 'text-muted-foreground', description: 'No data available' };
  }
};

export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    });
  });
};