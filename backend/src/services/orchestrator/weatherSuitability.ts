/**
 * Weather Suitability Matrix
 * 
 * Deterministic rules for assessing activity suitability based on weather conditions.
 * Applied before LLM to provide weather hints and constraints.
 */

export interface WeatherConditions {
  tMax: number; // Max temperature in Celsius
  precipMm: number; // Precipitation in mm
  windMps: number; // Wind speed in m/s
  condition: string; // Weather condition description
}

export interface ActivityWeatherRules {
  /** Temperature range (min, max) in Celsius */
  temperatureRange?: [number, number];
  
  /** Maximum acceptable precipitation (mm) */
  maxPrecipitation?: number;
  
  /** Maximum acceptable wind speed (m/s) */
  maxWindSpeed?: number;
  
  /** Preferred weather conditions */
  preferredConditions?: string[];
  
  /** Conditions that make activity unsuitable */
  unsuitableConditions?: string[];
  
  /** Indoor alternative available */
  hasIndoorAlternative?: boolean;
  
  /** Activity is weather-dependent */
  weatherDependent?: boolean;
}

/**
 * Weather suitability rules by activity subtype
 */
export const WEATHER_SUITABILITY_RULES: Record<string, ActivityWeatherRules> = {
  // Adventure Activities (highly weather-dependent)
  mountain_biking: {
    temperatureRange: [5, 35],
    maxPrecipitation: 2,
    maxWindSpeed: 15,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['rain', 'thunderstorm', 'snow', 'fog'],
    weatherDependent: true
  },
  
  downhill: {
    temperatureRange: [0, 35],
    maxPrecipitation: 1,
    maxWindSpeed: 20,
    preferredConditions: ['clear', 'partly_cloudy'],
    unsuitableConditions: ['rain', 'thunderstorm', 'snow', 'ice'],
    weatherDependent: true
  },
  
  via_ferrata: {
    temperatureRange: [5, 30],
    maxPrecipitation: 0,
    maxWindSpeed: 12,
    preferredConditions: ['clear', 'partly_cloudy'],
    unsuitableConditions: ['rain', 'thunderstorm', 'snow', 'fog', 'ice'],
    weatherDependent: true
  },
  
  rock_climbing: {
    temperatureRange: [0, 35],
    maxPrecipitation: 0,
    maxWindSpeed: 15,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['rain', 'thunderstorm', 'snow', 'ice'],
    hasIndoorAlternative: true,
    weatherDependent: true
  },
  
  paragliding: {
    temperatureRange: [10, 35],
    maxPrecipitation: 0,
    maxWindSpeed: 8,
    preferredConditions: ['clear', 'partly_cloudy'],
    unsuitableConditions: ['rain', 'thunderstorm', 'snow', 'fog', 'strong_wind'],
    weatherDependent: true
  },
  
  rafting: {
    temperatureRange: [15, 35],
    maxPrecipitation: 5,
    maxWindSpeed: 20,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['thunderstorm', 'strong_wind'],
    weatherDependent: true
  },
  
  canyoning: {
    temperatureRange: [15, 30],
    maxPrecipitation: 0,
    maxWindSpeed: 15,
    preferredConditions: ['clear', 'partly_cloudy'],
    unsuitableConditions: ['rain', 'thunderstorm', 'flash_flood_risk'],
    weatherDependent: true
  },
  
  ski_alpine: {
    temperatureRange: [-20, 5],
    maxPrecipitation: 10, // Snow is good
    maxWindSpeed: 25,
    preferredConditions: ['snow', 'clear', 'partly_cloudy'],
    unsuitableConditions: ['rain', 'fog', 'ice_storm'],
    weatherDependent: true
  },
  
  // Nature Activities (moderately weather-dependent)
  hiking: {
    temperatureRange: [-5, 35],
    maxPrecipitation: 3,
    maxWindSpeed: 20,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['thunderstorm', 'heavy_rain', 'blizzard'],
    weatherDependent: true
  },
  
  peak_bagging: {
    temperatureRange: [-10, 30],
    maxPrecipitation: 1,
    maxWindSpeed: 15,
    preferredConditions: ['clear', 'partly_cloudy'],
    unsuitableConditions: ['fog', 'thunderstorm', 'snow', 'ice'],
    weatherDependent: true
  },
  
  national_park: {
    temperatureRange: [-10, 40],
    maxPrecipitation: 5,
    maxWindSpeed: 25,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['severe_weather'],
    weatherDependent: false
  },
  
  wildlife_watching: {
    temperatureRange: [-5, 35],
    maxPrecipitation: 8,
    maxWindSpeed: 20,
    preferredConditions: ['clear', 'partly_cloudy', 'light_rain'],
    unsuitableConditions: ['thunderstorm', 'heavy_rain'],
    weatherDependent: false
  },
  
  cave_exploration: {
    temperatureRange: [-10, 40],
    maxPrecipitation: 20,
    maxWindSpeed: 30,
    preferredConditions: [], // Weather doesn't matter much
    unsuitableConditions: ['flash_flood_risk'],
    weatherDependent: false
  },
  
  waterfall: {
    temperatureRange: [-5, 35],
    maxPrecipitation: 10,
    maxWindSpeed: 25,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy', 'light_rain'],
    unsuitableConditions: ['thunderstorm', 'flash_flood_risk'],
    weatherDependent: false
  },
  
  // Water Activities (temperature and precipitation dependent)
  kayaking: {
    temperatureRange: [15, 35],
    maxPrecipitation: 3,
    maxWindSpeed: 12,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['thunderstorm', 'strong_wind', 'heavy_rain'],
    weatherDependent: true
  },
  
  sup: {
    temperatureRange: [18, 35],
    maxPrecipitation: 1,
    maxWindSpeed: 8,
    preferredConditions: ['clear', 'partly_cloudy'],
    unsuitableConditions: ['rain', 'thunderstorm', 'strong_wind'],
    weatherDependent: true
  },
  
  thermal_baths: {
    temperatureRange: [-20, 40],
    maxPrecipitation: 20,
    maxWindSpeed: 30,
    preferredConditions: [], // Great in any weather
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  boat_tour: {
    temperatureRange: [10, 35],
    maxPrecipitation: 5,
    maxWindSpeed: 15,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['thunderstorm', 'strong_wind', 'heavy_rain'],
    weatherDependent: true
  },
  
  // Culture Activities (mostly weather-independent)
  castle_visit: {
    temperatureRange: [-10, 40],
    maxPrecipitation: 20,
    maxWindSpeed: 30,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  fortified_churches: {
    temperatureRange: [-10, 40],
    maxPrecipitation: 20,
    maxWindSpeed: 30,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  street_art: {
    temperatureRange: [-5, 35],
    maxPrecipitation: 5,
    maxWindSpeed: 25,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['heavy_rain', 'thunderstorm'],
    weatherDependent: false
  },
  
  museums: {
    temperatureRange: [-20, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  // Wellness Activities (weather-independent)
  spa: {
    temperatureRange: [-20, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  yoga: {
    temperatureRange: [5, 35],
    maxPrecipitation: 15,
    maxWindSpeed: 30,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: [],
    hasIndoorAlternative: true,
    weatherDependent: false
  },
  
  wellness_retreat: {
    temperatureRange: [-10, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  // Nightlife Activities (weather-independent)
  live_music: {
    temperatureRange: [-20, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  nightclub: {
    temperatureRange: [-20, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  standup_comedy: {
    temperatureRange: [-20, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  // Culinary Activities (weather-independent)
  wine_tasting: {
    temperatureRange: [-10, 40],
    maxPrecipitation: 25,
    maxWindSpeed: 35,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  cooking_class: {
    temperatureRange: [-20, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  fine_dining: {
    temperatureRange: [-20, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  // Creative Activities (mostly weather-independent)
  photography: {
    temperatureRange: [-5, 35],
    maxPrecipitation: 8,
    maxWindSpeed: 25,
    preferredConditions: ['clear', 'partly_cloudy', 'dramatic_clouds'],
    unsuitableConditions: ['heavy_rain', 'fog'],
    weatherDependent: false
  },
  
  ceramics: {
    temperatureRange: [-10, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  maker_space: {
    temperatureRange: [-10, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  // Sports Activities (mixed)
  indoor_climbing: {
    temperatureRange: [-20, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  padel: {
    temperatureRange: [5, 35],
    maxPrecipitation: 2,
    maxWindSpeed: 20,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['rain', 'thunderstorm', 'strong_wind'],
    hasIndoorAlternative: true,
    weatherDependent: true
  },
  
  skateboarding: {
    temperatureRange: [0, 35],
    maxPrecipitation: 0,
    maxWindSpeed: 25,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['rain', 'wet_surfaces', 'ice'],
    hasIndoorAlternative: true,
    weatherDependent: true
  },
  
  // Learning Activities (weather-independent)
  language_exchange: {
    temperatureRange: [-20, 40],
    maxPrecipitation: 30,
    maxWindSpeed: 40,
    preferredConditions: [],
    unsuitableConditions: [],
    weatherDependent: false
  },
  
  volunteer: {
    temperatureRange: [-5, 35],
    maxPrecipitation: 10,
    maxWindSpeed: 30,
    preferredConditions: ['clear', 'partly_cloudy', 'cloudy'],
    unsuitableConditions: ['severe_weather'],
    weatherDependent: false
  },
  
  educational_tour: {
    temperatureRange: [-10, 40],
    maxPrecipitation: 15,
    maxWindSpeed: 30,
    preferredConditions: [],
    unsuitableConditions: ['severe_weather'],
    weatherDependent: false
  }
};

/**
 * Assess weather suitability for an activity subtype
 */
export function assessWeatherSuitability(
  subtype: string,
  weather: WeatherConditions
): {
  suitability: 'good' | 'ok' | 'bad';
  reason: string;
  alternativeConditions?: string;
} {
  const rules = WEATHER_SUITABILITY_RULES[subtype];
  
  if (!rules) {
    return {
      suitability: 'ok',
      reason: 'No specific weather requirements'
    };
  }
  
  const issues: string[] = [];
  let suitability: 'good' | 'ok' | 'bad' = 'good';
  
  // Check temperature range
  if (rules.temperatureRange) {
    const [minTemp, maxTemp] = rules.temperatureRange;
    if (weather.tMax < minTemp) {
      issues.push(`too cold (${weather.tMax}°C, need ≥${minTemp}°C)`);
      suitability = 'bad';
    } else if (weather.tMax > maxTemp) {
      issues.push(`too hot (${weather.tMax}°C, need ≤${maxTemp}°C)`);
      suitability = 'bad';
    }
  }
  
  // Check precipitation
  if (rules.maxPrecipitation !== undefined && weather.precipMm > rules.maxPrecipitation) {
    issues.push(`too much rain (${weather.precipMm}mm, need ≤${rules.maxPrecipitation}mm)`);
    suitability = rules.weatherDependent ? 'bad' : 'ok';
  }
  
  // Check wind speed
  if (rules.maxWindSpeed !== undefined && weather.windMps > rules.maxWindSpeed) {
    issues.push(`too windy (${weather.windMps}m/s, need ≤${rules.maxWindSpeed}m/s)`);
    suitability = rules.weatherDependent ? 'bad' : 'ok';
  }
  
  // Check unsuitable conditions
  if (rules.unsuitableConditions?.some(condition => 
    weather.condition.toLowerCase().includes(condition.toLowerCase())
  )) {
    issues.push(`unsuitable conditions (${weather.condition})`);
    suitability = 'bad';
  }
  
  // Check preferred conditions
  const hasPreferredCondition = !rules.preferredConditions?.length || 
    rules.preferredConditions.some(condition => 
      weather.condition.toLowerCase().includes(condition.toLowerCase())
    );
  
  if (!hasPreferredCondition && rules.weatherDependent) {
    suitability = suitability === 'good' ? 'ok' : suitability;
  }
  
  // Generate reason
  let reason: string;
  if (issues.length === 0) {
    reason = rules.weatherDependent 
      ? `Perfect weather conditions for ${subtype.replace('_', ' ')}`
      : `Weather conditions are suitable`;
  } else {
    reason = `Weather challenges: ${issues.join(', ')}`;
  }
  
  // Suggest alternatives
  let alternativeConditions: string | undefined;
  if (suitability === 'bad' && rules.hasIndoorAlternative) {
    alternativeConditions = 'Consider indoor alternatives';
  } else if (suitability === 'bad' && rules.preferredConditions?.length) {
    alternativeConditions = `Better in: ${rules.preferredConditions.join(', ')}`;
  }
  
  return {
    suitability,
    reason,
    alternativeConditions
  };
}

/**
 * Generate weather hints for all activity subtypes
 */
export function generateWeatherHints(
  subtypes: string[],
  weatherByRegion: Record<string, WeatherConditions[]>
): {
  suitabilityBySubtype: Record<string, {
    suitability: 'good' | 'ok' | 'bad';
    reason: string;
    alternativeConditions?: string;
  }>;
  regionalSummaries: Record<string, {
    overallCondition: string;
    suitableFor: string[];
    notSuitableFor: string[];
    bestDays: string[];
  }>;
} {
  const suitabilityBySubtype: Record<string, any> = {};
  const regionalSummaries: Record<string, any> = {};
  
  // Assess each subtype against average weather conditions
  subtypes.forEach(subtype => {
    // Use weather from all regions to get overall assessment
    const allWeatherConditions = Object.values(weatherByRegion).flat();
    if (allWeatherConditions.length > 0) {
      // Use the first day's weather as representative
      const representativeWeather = allWeatherConditions[0];
      suitabilityBySubtype[subtype] = assessWeatherSuitability(subtype, representativeWeather);
    }
  });
  
  // Generate regional summaries
  Object.entries(weatherByRegion).forEach(([region, weatherData]) => {
    if (weatherData.length === 0) return;
    
    const suitableFor: string[] = [];
    const notSuitableFor: string[] = [];
    const bestDays: string[] = [];
    
    // Check each subtype against this region's weather
    subtypes.forEach(subtype => {
      const assessment = assessWeatherSuitability(subtype, weatherData[0]);
      if (assessment.suitability === 'good') {
        suitableFor.push(subtype.replace('_', ' '));
      } else if (assessment.suitability === 'bad') {
        notSuitableFor.push(subtype.replace('_', ' '));
      }
    });
    
    // Find best weather days
    weatherData.forEach((weather, index) => {
      if (weather.precipMm < 2 && weather.windMps < 15) {
        bestDays.push(`Day ${index + 1}`);
      }
    });
    
    regionalSummaries[region] = {
      overallCondition: weatherData[0].condition,
      suitableFor: suitableFor.slice(0, 5), // Limit to top 5
      notSuitableFor: notSuitableFor.slice(0, 3), // Limit to top 3
      bestDays: bestDays.slice(0, 3) // Limit to 3 days
    };
  });
  
  return {
    suitabilityBySubtype,
    regionalSummaries
  };
}
