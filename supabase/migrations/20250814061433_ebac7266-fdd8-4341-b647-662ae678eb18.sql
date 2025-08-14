-- Create weather_searches table to store search history
CREATE TABLE public.weather_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  temperature NUMERIC NOT NULL,
  humidity INTEGER NOT NULL,
  pressure INTEGER NOT NULL,
  weather_description TEXT NOT NULL,
  weather_icon TEXT NOT NULL,
  feels_like NUMERIC NOT NULL,
  wind_speed NUMERIC NOT NULL,
  visibility INTEGER NOT NULL,
  uv_index NUMERIC,
  searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.weather_searches ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own weather searches" 
ON public.weather_searches 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weather searches" 
ON public.weather_searches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather searches" 
ON public.weather_searches 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weather searches" 
ON public.weather_searches 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weather_searches_updated_at
BEFORE UPDATE ON public.weather_searches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();