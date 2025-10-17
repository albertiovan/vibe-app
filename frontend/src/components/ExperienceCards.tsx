/**
 * 5-Card Experiences View
 * Displays exactly 5 diverse experience cards with bucket diversity
 */

import React from 'react';
import { ExperienceCard } from '../hooks/useVibeSearchPipeline';
import { getBucketInfo, ExperienceBucket } from '../types/experiences';

interface ExperienceCardsProps {
  cards: ExperienceCard[];
  loading: boolean;
  error: string | null;
  onCardClick: (card: ExperienceCard) => void;
  onRetry?: () => void;
}

export function ExperienceCards({ 
  cards, 
  loading, 
  error, 
  onCardClick, 
  onRetry 
}: ExperienceCardsProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (cards.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="experience-cards">
      <div className="cards-header">
        <h2 className="cards-title">
          Your Perfect Experiences
          <span className="cards-count">{cards.length}/5</span>
        </h2>
        <div className="diversity-indicator">
          <DiversityIndicator cards={cards} />
        </div>
      </div>

      <div className="cards-grid">
        {cards.map((card, index) => (
          <ExperienceCardComponent
            key={card.id}
            card={card}
            index={index}
            onClick={() => onCardClick(card)}
          />
        ))}
      </div>

      <div className="cards-footer">
        <WeatherInfo cards={cards} />
      </div>
    </div>
  );
}

/**
 * Individual Experience Card Component
 */
function ExperienceCardComponent({ 
  card, 
  index, 
  onClick 
}: { 
  card: ExperienceCard; 
  index: number; 
  onClick: () => void; 
}) {
  const bucketInfo = getBucketInfo(card.bucket);
  
  return (
    <div 
      className={`experience-card card-${index + 1}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="bucket-badge" style={{ backgroundColor: bucketInfo.color }}>
          <span className="bucket-icon">{bucketInfo.icon}</span>
          <span className="bucket-name">{bucketInfo.name}</span>
        </div>
        <div className="card-meta">
          {card.rating && (
            <div className="rating">
              <span className="rating-stars">★</span>
              <span className="rating-value">{card.rating.toFixed(1)}</span>
            </div>
          )}
          {card.distance && (
            <div className="distance">
              <span className="distance-value">{card.distance.toFixed(1)}km</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Image */}
      <div className="card-image">
        {card.imageUrl ? (
          <img 
            src={card.imageUrl} 
            alt={card.title}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder" style={{ backgroundColor: bucketInfo.color + '20' }}>
            <span className="placeholder-icon">{bucketInfo.icon}</span>
          </div>
        )}
        
        {/* Weather Suitability Indicator */}
        <div className={`weather-indicator ${getWeatherClass(card.weatherSuitability)}`}>
          <span className="weather-icon">{getWeatherIcon(card.weatherSuitability)}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <h3 className="card-title">{card.title}</h3>
        <p className="card-description">{card.description}</p>
        
        {/* Highlights */}
        {card.highlights.length > 0 && (
          <div className="card-highlights">
            {card.highlights.map((highlight, i) => (
              <span key={i} className="highlight-tag">
                {highlight}
              </span>
            ))}
          </div>
        )}

        {/* Travel Info */}
        <div className="travel-info">
          {card.travelTime && (
            <span className="travel-time">
              🚗 {card.travelTime}min
            </span>
          )}
          {card.priceLevel !== undefined && (
            <span className="price-level">
              {'$'.repeat(card.priceLevel + 1)}
            </span>
          )}
        </div>
      </div>

      {/* Drill-down Indicator */}
      <div className="drill-down-indicator">
        <span className="drill-down-text">
          Tap for {card.drillDownData.type === 'trails' ? 'trails' : 'venues'}
        </span>
        <span className="drill-down-arrow">→</span>
      </div>
    </div>
  );
}

/**
 * Diversity Indicator Component
 */
function DiversityIndicator({ cards }: { cards: ExperienceCard[] }) {
  const buckets = [...new Set(cards.map(card => card.bucket))];
  const diversityScore = buckets.length / 5; // Out of 5 possible buckets
  
  return (
    <div className="diversity-indicator">
      <div className="diversity-score">
        <span className="score-label">Diversity</span>
        <div className="score-bar">
          <div 
            className="score-fill" 
            style={{ width: `${diversityScore * 100}%` }}
          />
        </div>
        <span className="score-text">{buckets.length}/5</span>
      </div>
      
      <div className="bucket-icons">
        {buckets.map(bucket => {
          const info = getBucketInfo(bucket);
          return (
            <span 
              key={bucket}
              className="bucket-icon-small"
              title={info.name}
              style={{ color: info.color }}
            >
              {info.icon}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Weather Info Component
 */
function WeatherInfo({ cards }: { cards: ExperienceCard[] }) {
  const avgWeatherSuitability = cards.reduce((sum, card) => 
    sum + card.weatherSuitability, 0
  ) / cards.length;

  const weatherMessage = getWeatherMessage(avgWeatherSuitability);
  
  return (
    <div className="weather-info">
      <span className="weather-icon">{getWeatherIcon(avgWeatherSuitability)}</span>
      <span className="weather-message">{weatherMessage}</span>
    </div>
  );
}

/**
 * Loading State Component
 */
function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-header">
        <div className="loading-title">Finding your perfect experiences...</div>
        <div className="loading-subtitle">Analyzing weather, location, and preferences</div>
      </div>
      
      <div className="loading-cards">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="loading-card">
            <div className="loading-image" />
            <div className="loading-content">
              <div className="loading-line loading-title" />
              <div className="loading-line loading-description" />
              <div className="loading-line loading-meta" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="loading-steps">
        <div className="step active">📍 Getting location</div>
        <div className="step active">🌤️ Checking weather</div>
        <div className="step active">🧠 Understanding vibe</div>
        <div className="step active">🔍 Finding experiences</div>
        <div className="step">🎯 Curating top 5</div>
      </div>
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Something went wrong</h3>
      <p className="error-message">{error}</p>
      
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      )}
      
      <div className="error-suggestions">
        <h4>Try these suggestions:</h4>
        <ul>
          <li>Check your internet connection</li>
          <li>Enable location services</li>
          <li>Try a different search term</li>
          <li>Expand your search radius</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">🔍</div>
      <h3 className="empty-title">No experiences found</h3>
      <p className="empty-message">
        We couldn't find any experiences matching your vibe. 
        Try adjusting your search or expanding the area.
      </p>
      
      <div className="empty-suggestions">
        <h4>Suggestions:</h4>
        <ul>
          <li>Try a broader search term</li>
          <li>Increase your search radius</li>
          <li>Consider indoor alternatives</li>
          <li>Check different times of day</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Utility Functions
 */
function getWeatherClass(suitability: number): string {
  if (suitability >= 0.8) return 'weather-excellent';
  if (suitability >= 0.6) return 'weather-good';
  if (suitability >= 0.4) return 'weather-fair';
  return 'weather-poor';
}

function getWeatherIcon(suitability: number): string {
  if (suitability >= 0.8) return '☀️';
  if (suitability >= 0.6) return '⛅';
  if (suitability >= 0.4) return '🌧️';
  return '🌩️';
}

function getWeatherMessage(avgSuitability: number): string {
  if (avgSuitability >= 0.8) return 'Perfect weather for these activities';
  if (avgSuitability >= 0.6) return 'Good weather conditions';
  if (avgSuitability >= 0.4) return 'Weather may affect some activities';
  return 'Indoor alternatives recommended';
}
