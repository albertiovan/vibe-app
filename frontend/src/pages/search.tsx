/**
 * Main Search Page
 * Integrates vibe search pipeline with 5-card experience display
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useVibeSearchPipeline } from '../hooks/useVibeSearchPipeline';
import { ExperienceCards } from '../components/ExperienceCards';
import { ExperienceCard } from '../hooks/useVibeSearchPipeline';
import { logTelemetry } from '../services/telemetry';

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState({
    radiusKm: 15,
    maxTravelMinutes: 60,
    enableWeatherGating: true
  });

  const {
    cards,
    loading,
    error,
    weather,
    location,
    telemetry,
    searchExperiences,
    clearResults,
    retryWithRelaxedConstraints,
    isSearching
  } = useVibeSearchPipeline();

  /**
   * Handle search submission
   */
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    // Log search initiation
    logTelemetry('search_initiated', {
      query: query.slice(0, 50), // First 50 chars only (no PII)
      queryLength: query.length,
      options: searchOptions,
      timestamp: new Date().toISOString()
    });

    try {
      await searchExperiences(query, searchOptions);
      
      // Log successful search
      logTelemetry('search_completed', {
        resultsCount: cards.length,
        processingTime: telemetry.processingTime,
        weatherGating: telemetry.weatherGatingApplied,
        fallbacks: telemetry.fallbacksTriggered,
        constraintsRelaxed: telemetry.constraintsRelaxed,
        location: location ? `${location.city}, ${location.country}` : 'unknown',
        weather: weather?.recommendation || 'none'
      });
    } catch (searchError) {
      // Log search failure
      logTelemetry('search_failed', {
        error: searchError instanceof Error ? searchError.message : 'unknown',
        processingTime: telemetry.processingTime,
        fallbacks: telemetry.fallbacksTriggered
      });
    }
  }, [searchExperiences, searchOptions, cards.length, telemetry, location, weather]);

  /**
   * Handle card click - navigate to drill-down
   */
  const handleCardClick = useCallback((card: ExperienceCard) => {
    // Store card data for drill-down page
    sessionStorage.setItem('selectedExperienceCard', JSON.stringify(card));
    
    // Log card interaction
    logTelemetry('card_clicked', {
      cardId: card.id,
      cardTitle: card.title.slice(0, 30), // Truncated title
      bucket: card.bucket,
      rating: card.rating,
      distance: card.distance,
      weatherSuitability: card.weatherSuitability,
      drillDownType: card.drillDownData.type
    });

    // Navigate to drill-down page
    router.push(`/activity/${encodeURIComponent(card.id)}`);
  }, [router]);

  /**
   * Handle retry with relaxed constraints
   */
  const handleRetryRelaxed = useCallback(async () => {
    if (!searchQuery.trim()) return;

    logTelemetry('retry_relaxed_initiated', {
      originalResults: cards.length,
      originalConstraints: searchOptions
    });

    try {
      await retryWithRelaxedConstraints(searchQuery);
      
      logTelemetry('retry_relaxed_completed', {
        newResults: cards.length,
        constraintsRelaxed: telemetry.constraintsRelaxed,
        fallbacks: telemetry.fallbacksTriggered
      });
    } catch (retryError) {
      logTelemetry('retry_relaxed_failed', {
        error: retryError instanceof Error ? retryError.message : 'unknown'
      });
    }
  }, [searchQuery, retryWithRelaxedConstraints, cards.length, searchOptions, telemetry]);

  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-header">
        <div className="search-container">
          <h1 className="search-title">Find Your Perfect Experience</h1>
          <p className="search-subtitle">
            Tell us your vibe and we'll find exactly 5 diverse activities for you
          </p>

          {/* Search Input */}
          <div className="search-input-container">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              loading={isSearching}
              placeholder="I want outdoor adventures with mountain biking..."
            />
          </div>

          {/* Search Options */}
          <SearchOptions
            options={searchOptions}
            onChange={setSearchOptions}
            disabled={isSearching}
          />

          {/* Location & Weather Info */}
          {(location || weather) && (
            <div className="context-info">
              {location && (
                <div className="location-info">
                  📍 {location.city ? `${location.city}, ${location.country}` : 'Location detected'}
                </div>
              )}
              {weather && (
                <div className="weather-info">
                  🌤️ {Math.round(weather.temperature)}°C, {weather.conditions.replace(/_/g, ' ')}
                  {weather.recommendation !== 'outdoor' && (
                    <span className="weather-warning">
                      ({weather.recommendation} activities recommended)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="search-results">
        <ExperienceCards
          cards={cards}
          loading={loading}
          error={error}
          onCardClick={handleCardClick}
          onRetry={() => handleSearch(searchQuery)}
        />

        {/* Results Info & Actions */}
        {cards.length > 0 && (
          <div className="results-info">
            <ResultsMetrics
              cards={cards}
              telemetry={telemetry}
              weather={weather}
            />
            
            {cards.length < 5 && (
              <div className="results-actions">
                <button 
                  className="expand-search-button"
                  onClick={handleRetryRelaxed}
                  disabled={isSearching}
                >
                  🔍 Find More Options
                </button>
              </div>
            )}
          </div>
        )}

        {/* Telemetry Debug (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <TelemetryDebug telemetry={telemetry} />
        )}
      </div>
    </div>
  );
}

/**
 * Search Input Component
 */
function SearchInput({ 
  value, 
  onChange, 
  onSubmit, 
  loading, 
  placeholder 
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  loading: boolean;
  placeholder: string;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading || !value.trim()}
        >
          {loading ? '🔍' : '✨'}
        </button>
      </div>
    </form>
  );
}

/**
 * Search Options Component
 */
function SearchOptions({ 
  options, 
  onChange, 
  disabled 
}: {
  options: any;
  onChange: (options: any) => void;
  disabled: boolean;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="search-options">
      <button
        className="toggle-options"
        onClick={() => setShowAdvanced(!showAdvanced)}
        disabled={disabled}
      >
        ⚙️ {showAdvanced ? 'Hide' : 'Show'} Options
      </button>

      {showAdvanced && (
        <div className="advanced-options">
          <div className="option-group">
            <label className="option-label">
              Search Radius: {options.radiusKm}km
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={options.radiusKm}
              onChange={(e) => onChange({
                ...options,
                radiusKm: parseInt(e.target.value)
              })}
              disabled={disabled}
            />
          </div>

          <div className="option-group">
            <label className="option-label">
              Max Travel Time: {options.maxTravelMinutes}min
            </label>
            <input
              type="range"
              min="15"
              max="120"
              value={options.maxTravelMinutes}
              onChange={(e) => onChange({
                ...options,
                maxTravelMinutes: parseInt(e.target.value)
              })}
              disabled={disabled}
            />
          </div>

          <div className="option-group">
            <label className="option-checkbox">
              <input
                type="checkbox"
                checked={options.enableWeatherGating}
                onChange={(e) => onChange({
                  ...options,
                  enableWeatherGating: e.target.checked
                })}
                disabled={disabled}
              />
              Consider weather conditions
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Results Metrics Component
 */
function ResultsMetrics({ 
  cards, 
  telemetry, 
  weather 
}: {
  cards: ExperienceCard[];
  telemetry: any;
  weather: any;
}) {
  const buckets = [...new Set(cards.map(card => card.bucket))];
  const avgRating = cards.reduce((sum, card) => sum + (card.rating || 0), 0) / cards.length;
  const avgDistance = cards.reduce((sum, card) => sum + (card.distance || 0), 0) / cards.length;

  return (
    <div className="results-metrics">
      <div className="metric">
        <span className="metric-label">Diversity:</span>
        <span className="metric-value">{buckets.length}/5 categories</span>
      </div>
      
      <div className="metric">
        <span className="metric-label">Avg Rating:</span>
        <span className="metric-value">⭐ {avgRating.toFixed(1)}</span>
      </div>
      
      <div className="metric">
        <span className="metric-label">Avg Distance:</span>
        <span className="metric-value">📍 {avgDistance.toFixed(1)}km</span>
      </div>
      
      <div className="metric">
        <span className="metric-label">Search Time:</span>
        <span className="metric-value">⚡ {(telemetry.processingTime / 1000).toFixed(1)}s</span>
      </div>

      {telemetry.weatherGatingApplied && (
        <div className="metric weather-applied">
          <span className="metric-label">🌤️ Weather filtering applied</span>
        </div>
      )}
    </div>
  );
}

/**
 * Telemetry Debug Component (dev only)
 */
function TelemetryDebug({ telemetry }: { telemetry: any }) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="telemetry-debug">
      <h4>🔧 Debug Info</h4>
      <pre>{JSON.stringify(telemetry, null, 2)}</pre>
    </div>
  );
}
