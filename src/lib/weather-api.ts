import axios from 'axios';
import { CurrentWeather, WeatherForecast, LocationData, UVIndex, AirQuality } from '@/types/weather';

const BASE_URL = 'https://api.openweathermap.org';

export class WeatherAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getUrl(endpoint: string, params: Record<string, string | number> = {}) {
    const searchParams = new URLSearchParams({
      appid: this.apiKey,
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    });
    return `${BASE_URL}${endpoint}?${searchParams}`;
  }

  async getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
    const url = this.getUrl('/data/2.5/weather', {
      lat,
      lon,
      units: 'metric'
    });
    const response = await axios.get(url);
    return response.data;
  }

  async getForecast(lat: number, lon: number): Promise<WeatherForecast> {
    const url = this.getUrl('/data/2.5/forecast', {
      lat,
      lon,
      units: 'metric'
    });
    const response = await axios.get(url);
    return response.data;
  }

  async searchLocations(query: string): Promise<LocationData[]> {
    const url = this.getUrl('/geo/1.0/direct', {
      q: query,
      limit: 5
    });
    const response = await axios.get(url);
    return response.data;
  }

  async getLocationByCoords(lat: number, lon: number): Promise<LocationData[]> {
    const url = this.getUrl('/geo/1.0/reverse', {
      lat,
      lon,
      limit: 1
    });
    const response = await axios.get(url);
    return response.data;
  }

  async getUVIndex(lat: number, lon: number): Promise<UVIndex> {
    const url = this.getUrl('/data/2.5/uvi', {
      lat,
      lon
    });
    const response = await axios.get(url);
    return response.data;
  }

  async getAirQuality(lat: number, lon: number): Promise<AirQuality> {
    const url = this.getUrl('/data/2.5/air_pollution', {
      lat,
      lon
    });
    const response = await axios.get(url);
    return response.data;
  }
}

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem('openweather_api_key');
};

export const storeApiKey = (apiKey: string): void => {
  localStorage.setItem('openweather_api_key', apiKey);
};

export const removeApiKey = (): void => {
  localStorage.removeItem('openweather_api_key');
};