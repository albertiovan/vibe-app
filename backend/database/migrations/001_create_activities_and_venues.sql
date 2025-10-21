-- Migration: Create activities and venues tables
-- Version: 001
-- Date: 2025-10-20

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  seasonality TEXT[],
  indoor_outdoor TEXT CHECK (indoor_outdoor IN ('indoor', 'outdoor', 'both')),
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high', 'very-high')),
  duration_min INT CHECK (duration_min > 0),
  duration_max INT CHECK (duration_max >= duration_min),
  tags TEXT[] DEFAULT '{}',
  hero_image_url TEXT,
  youtube_video_ids TEXT[] DEFAULT '{}',
  city TEXT,
  region TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create venues table
CREATE TABLE IF NOT EXISTS venues (
  id SERIAL PRIMARY KEY,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  region TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  price_tier TEXT CHECK (price_tier IN ('free', 'budget', 'moderate', 'premium', 'luxury')),
  booking_url TEXT,
  seasonality TEXT[],
  tags TEXT[] DEFAULT '{}',
  phone TEXT,
  website TEXT,
  rating NUMERIC(3, 2) CHECK (rating >= 0 AND rating <= 5),
  rating_count INT CHECK (rating_count >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_region ON activities(region);
CREATE INDEX IF NOT EXISTS idx_activities_energy_level ON activities(energy_level);
CREATE INDEX IF NOT EXISTS idx_activities_indoor_outdoor ON activities(indoor_outdoor);
CREATE INDEX IF NOT EXISTS idx_activities_tags ON activities USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_venues_activity_id ON venues(activity_id);
CREATE INDEX IF NOT EXISTS idx_venues_region ON venues(region);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_price_tier ON venues(price_tier);
CREATE INDEX IF NOT EXISTS idx_venues_rating ON venues(rating);
CREATE INDEX IF NOT EXISTS idx_venues_tags ON venues USING GIN(tags);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE activities IS 'Curated activities available in the Vibe app';
COMMENT ON TABLE venues IS 'Venues that offer specific activities';

COMMENT ON COLUMN activities.seasonality IS 'Array of seasons when activity is available: spring, summer, fall, winter, year-round';
COMMENT ON COLUMN activities.energy_level IS 'Physical/mental energy required: low, medium, high, very-high';
COMMENT ON COLUMN activities.indoor_outdoor IS 'Where activity takes place: indoor, outdoor, both';
COMMENT ON COLUMN activities.youtube_video_ids IS 'Array of YouTube video IDs for tutorials/inspiration';

COMMENT ON COLUMN venues.price_tier IS 'Price range: free, budget, moderate, premium, luxury';
COMMENT ON COLUMN venues.rating IS 'Venue rating from 0-5';
