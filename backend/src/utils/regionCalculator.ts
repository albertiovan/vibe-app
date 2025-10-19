/**
 * Region Distance Calculator
 * 
 * Utilities for calculating distances between regions and finding nearby regions
 * for multi-region search fan-out.
 */

import fs from 'fs';
import path from 'path';

export interface Region {
  id: string;
  name: string;
  nameRo: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  population: number;
  type: string;
  description: string;
  keywords: string[];
  specialties: string[];
  distanceFromBucharest?: number;
}

export interface RegionsData {
  regions: Region[];
  metadata: {
    version: string;
    lastUpdated: string;
    description: string;
    maxTravelDistance: number;
    coordinateSystem: string;
  };
}

let cachedRegionsData: RegionsData | null = null;

/**
 * Load Romanian regions data
 */
export function loadRegionsData(): RegionsData {
  if (cachedRegionsData) {
    return cachedRegionsData;
  }

  try {
    // Use process.cwd() to get project root, then navigate to data folder
    const dataPath = path.resolve(process.cwd(), 'data/regions.ro.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    cachedRegionsData = JSON.parse(rawData) as RegionsData;
    return cachedRegionsData;
  } catch (error) {
    console.error('❌ Failed to load regions data:', error);
    throw new Error('Could not load Romanian regions data');
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Find regions within travel distance from origin
 */
export function findNearbyRegions(
  origin: { lat: number; lng: number },
  maxDistanceKm: number = 250
): Array<Region & { distance: number }> {
  const regionsData = loadRegionsData();
  
  return regionsData.regions
    .map(region => ({
      ...region,
      distance: calculateDistance(origin, region.coordinates)
    }))
    .filter(region => region.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Get region by ID
 */
export function getRegionById(regionId: string): Region | null {
  const regionsData = loadRegionsData();
  return regionsData.regions.find(region => region.id === regionId) || null;
}

/**
 * Find the closest region to given coordinates
 */
export function findClosestRegion(coordinates: { lat: number; lng: number }): Region & { distance: number } {
  const regionsData = loadRegionsData();
  
  let closest = regionsData.regions[0];
  let minDistance = calculateDistance(coordinates, closest.coordinates);
  
  for (const region of regionsData.regions.slice(1)) {
    const distance = calculateDistance(coordinates, region.coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      closest = region;
    }
  }
  
  return {
    ...closest,
    distance: minDistance
  };
}

/**
 * Get regions suitable for specific activity types
 */
export function getRegionsForActivityType(activityType: string): Region[] {
  const regionsData = loadRegionsData();
  
  const activityMappings: Record<string, string[]> = {
    skiing: ['sinaia', 'predeal', 'brasov', 'busteni'],
    beaches: ['constanta', 'mamaia'],
    mountains: ['brasov', 'sinaia', 'predeal', 'busteni'],
    culture: ['bucharest', 'sibiu', 'brasov', 'cluj_napoca', 'timisoara'],
    nightlife: ['bucharest', 'constanta', 'mamaia', 'cluj_napoca'],
    historic: ['brasov', 'sibiu', 'timisoara', 'bucharest'],
    nature: ['brasov', 'sinaia', 'busteni', 'predeal'],
    tech: ['bucharest', 'cluj_napoca', 'timisoara'],
    universities: ['bucharest', 'cluj_napoca', 'timisoara'],
    castles: ['sinaia', 'brasov', 'sibiu']
  };
  
  const relevantRegionIds = activityMappings[activityType.toLowerCase()] || [];
  
  return regionsData.regions.filter(region => 
    relevantRegionIds.includes(region.id)
  );
}

/**
 * Calculate estimated travel time between regions
 */
export function calculateTravelTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: 'drive' | 'transit' = 'drive'
): number {
  const distance = calculateDistance(origin, destination);
  
  // Average speeds in km/h
  const speeds = {
    drive: distance <= 10 ? 30 : distance <= 50 ? 50 : 70,
    transit: distance <= 10 ? 25 : distance <= 50 ? 40 : 60
  };
  
  return Math.round((distance / speeds[mode]) * 60); // Return minutes
}

/**
 * Validate if a region search is feasible for given duration
 */
export function isRegionFeasibleForDuration(
  origin: { lat: number; lng: number },
  region: Region,
  durationHours: number
): boolean {
  const travelTimeMinutes = calculateTravelTime(origin, region.coordinates);
  const roundTripTravelMinutes = travelTimeMinutes * 2;
  const availableActivityMinutes = (durationHours * 60) - roundTripTravelMinutes;
  
  // Need at least 2 hours for activities after travel
  return availableActivityMinutes >= 120;
}
