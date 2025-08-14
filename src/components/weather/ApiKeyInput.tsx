import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, ExternalLink } from 'lucide-react';
import { storeApiKey } from '@/lib/weather-api';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsSubmitting(true);
    try {
      storeApiKey(apiKey.trim());
      onApiKeySet(apiKey.trim());
    } catch (error) {
      console.error('Error storing API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-atmospheric p-4">
      <Card className="w-full max-w-md shadow-weather border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-sky rounded-full flex items-center justify-center shadow-glow-primary">
            <Key className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-sky bg-clip-text text-transparent">
              Weather Dashboard
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Enter your OpenWeatherMap API key to access comprehensive weather data
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium text-foreground">
                API Key
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your OpenWeatherMap API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="transition-smooth focus:shadow-glow-primary"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-sky hover:shadow-glow-primary transition-smooth"
              disabled={isSubmitting || !apiKey.trim()}
            >
              {isSubmitting ? 'Setting up...' : 'Start Weather Dashboard'}
            </Button>
          </form>
          
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">
              Don't have an API key? Get one for free:
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full hover:bg-muted transition-smooth"
              onClick={() => window.open('https://openweathermap.org/api', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get OpenWeatherMap API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyInput;