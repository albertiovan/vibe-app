/**
 * Activity Drill-Down Page
 * Shows detailed view with multiple services/venues for the selected activity
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useActivityDrillDown } from '../../hooks/useActivityDrillDown';
import { ExperienceCard } from '../../hooks/useVibeSearchPipeline';
import { getBucketInfo } from '../../types/experiences';

export default function ActivityPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [selectedCard, setSelectedCard] = useState<ExperienceCard | null>(null);
  
  const {
    trails,
    venues,
    operators,
    loading,
    error,
    searchRelated,
    clearResults
  } = useActivityDrillDown();

  useEffect(() => {
    // Get the selected card from session storage or navigation state
    const cardData = sessionStorage.getItem('selectedExperienceCard');
    if (cardData) {
      const card = JSON.parse(cardData);
      setSelectedCard(card);
      
      // Search for related content
      searchRelated(card);
    } else if (typeof id === 'string') {
      // Fallback: try to reconstruct from ID
      router.push('/');
    }
  }, [id, searchRelated, router]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      clearResults();
      sessionStorage.removeItem('selectedExperienceCard');
    };
  }, [clearResults]);

  if (!selectedCard) {
    return <LoadingPage />;
  }

  const bucketInfo = getBucketInfo(selectedCard.bucket);

  return (
    <div className="activity-page">
      {/* Header */}
      <ActivityHeader 
        card={selectedCard} 
        bucketInfo={bucketInfo}
        onBack={() => router.back()}
      />

      {/* Content */}
      <div className="activity-content">
        {loading ? (
          <LoadingContent />
        ) : error ? (
          <ErrorContent error={error} onRetry={() => searchRelated(selectedCard)} />
        ) : (
          <ActivityContent 
            card={selectedCard}
            trails={trails}
            venues={venues}
            operators={operators}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Activity Header Component
 */
function ActivityHeader({ 
  card, 
  bucketInfo, 
  onBack 
}: { 
  card: ExperienceCard; 
  bucketInfo: any; 
  onBack: () => void; 
}) {
  return (
    <div className="activity-header">
      <div className="header-background" style={{ backgroundColor: bucketInfo.color + '20' }}>
        <button className="back-button" onClick={onBack}>
          ← Back to Results
        </button>
        
        <div className="header-content">
          <div className="bucket-info">
            <span className="bucket-icon-large">{bucketInfo.icon}</span>
            <span className="bucket-name">{bucketInfo.name}</span>
          </div>
          
          <h1 className="activity-title">{card.title}</h1>
          <p className="activity-description">{card.description}</p>
          
          <div className="activity-meta">
            {card.rating && (
              <div className="meta-item">
                <span className="meta-icon">⭐</span>
                <span className="meta-value">{card.rating.toFixed(1)}</span>
              </div>
            )}
            
            {card.distance && (
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span className="meta-value">{card.distance.toFixed(1)}km away</span>
              </div>
            )}
            
            {card.travelTime && (
              <div className="meta-item">
                <span className="meta-icon">🚗</span>
                <span className="meta-value">{card.travelTime}min drive</span>
              </div>
            )}
            
            <div className="meta-item">
              <span className="meta-icon">🌤️</span>
              <span className="meta-value">
                {card.weatherSuitability >= 0.8 ? 'Perfect weather' : 
                 card.weatherSuitability >= 0.6 ? 'Good conditions' : 
                 'Weather aware'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Activity Content Component
 */
function ActivityContent({ 
  card, 
  trails, 
  venues, 
  operators 
}: { 
  card: ExperienceCard;
  trails: any[];
  venues: any[];
  operators: any[];
}) {
  const hasTrails = trails.length > 0;
  const hasVenues = venues.length > 0;
  const hasOperators = operators.length > 0;

  return (
    <div className="activity-sections">
      {/* Trails Section */}
      {hasTrails && (
        <section className="content-section">
          <h2 className="section-title">
            🥾 Trails & Routes
            <span className="section-count">({trails.length})</span>
          </h2>
          <div className="trails-grid">
            {trails.map((trail, index) => (
              <TrailCard key={trail.id} trail={trail} />
            ))}
          </div>
        </section>
      )}

      {/* Venues Section */}
      {hasVenues && (
        <section className="content-section">
          <h2 className="section-title">
            📍 Venues & Locations
            <span className="section-count">({venues.length})</span>
          </h2>
          <div className="venues-grid">
            {venues.map((venue, index) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </section>
      )}

      {/* Operators Section */}
      {hasOperators && (
        <section className="content-section">
          <h2 className="section-title">
            🏪 Services & Rentals
            <span className="section-count">({operators.length})</span>
          </h2>
          <div className="operators-grid">
            {operators.map((operator, index) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!hasTrails && !hasVenues && !hasOperators && (
        <div className="empty-drill-down">
          <div className="empty-icon">🔍</div>
          <h3>No additional details found</h3>
          <p>We couldn't find specific trails, venues, or services for this activity.</p>
          <p>The main location details are shown above.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-button primary">
          📍 Get Directions
        </button>
        <button className="action-button secondary">
          📞 Contact Info
        </button>
        <button className="action-button secondary">
          🌐 Website
        </button>
        <button className="action-button secondary">
          💾 Save for Later
        </button>
      </div>
    </div>
  );
}

/**
 * Trail Card Component
 */
function TrailCard({ trail }: { trail: any }) {
  return (
    <div className="trail-card">
      <div className="trail-header">
        <h3 className="trail-name">{trail.name}</h3>
        <div className="trail-type">{trail.type}</div>
      </div>
      
      <div className="trail-details">
        {trail.difficulty && (
          <div className="detail-item">
            <span className="detail-label">Difficulty:</span>
            <span className={`difficulty-badge ${trail.difficulty}`}>
              {trail.difficulty}
            </span>
          </div>
        )}
        
        {trail.distance && (
          <div className="detail-item">
            <span className="detail-label">Distance:</span>
            <span className="detail-value">{trail.distance}km</span>
          </div>
        )}
        
        {trail.elevation && (
          <div className="detail-item">
            <span className="detail-label">Elevation:</span>
            <span className="detail-value">+{trail.elevation}m</span>
          </div>
        )}
        
        {trail.surface && (
          <div className="detail-item">
            <span className="detail-label">Surface:</span>
            <span className="detail-value">{trail.surface}</span>
          </div>
        )}
      </div>
      
      {trail.description && (
        <p className="trail-description">{trail.description}</p>
      )}
    </div>
  );
}

/**
 * Venue Card Component
 */
function VenueCard({ venue }: { venue: any }) {
  return (
    <div className="venue-card">
      <div className="venue-header">
        <h3 className="venue-name">{venue.name}</h3>
        {venue.rating && (
          <div className="venue-rating">
            ⭐ {venue.rating.toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="venue-details">
        {venue.address && (
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span className="detail-value">{venue.address}</span>
          </div>
        )}
        
        {venue.distance && (
          <div className="detail-item">
            <span className="detail-icon">🚗</span>
            <span className="detail-value">{venue.distance.toFixed(1)}km away</span>
          </div>
        )}
        
        {venue.priceLevel !== undefined && (
          <div className="detail-item">
            <span className="detail-icon">💰</span>
            <span className="detail-value">{'$'.repeat(venue.priceLevel + 1)}</span>
          </div>
        )}
      </div>
      
      {venue.description && (
        <p className="venue-description">{venue.description}</p>
      )}
      
      <div className="venue-actions">
        <button className="venue-action">View Details</button>
        <button className="venue-action">Get Directions</button>
      </div>
    </div>
  );
}

/**
 * Operator Card Component
 */
function OperatorCard({ operator }: { operator: any }) {
  return (
    <div className="operator-card">
      <div className="operator-header">
        <h3 className="operator-name">{operator.name}</h3>
        {operator.rating && (
          <div className="operator-rating">
            ⭐ {operator.rating.toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="operator-services">
        {operator.services?.map((service: string, index: number) => (
          <span key={index} className="service-tag">
            {service}
          </span>
        ))}
      </div>
      
      <div className="operator-details">
        {operator.phone && (
          <div className="detail-item">
            <span className="detail-icon">📞</span>
            <span className="detail-value">{operator.phone}</span>
          </div>
        )}
        
        {operator.website && (
          <div className="detail-item">
            <span className="detail-icon">🌐</span>
            <span className="detail-value">Website</span>
          </div>
        )}
        
        {operator.hours && (
          <div className="detail-item">
            <span className="detail-icon">🕒</span>
            <span className="detail-value">{operator.hours}</span>
          </div>
        )}
      </div>
      
      <div className="operator-actions">
        <button className="operator-action primary">Contact</button>
        <button className="operator-action secondary">Visit Website</button>
      </div>
    </div>
  );
}

/**
 * Loading Components
 */
function LoadingPage() {
  return (
    <div className="loading-page">
      <div className="loading-spinner"></div>
      <p>Loading activity details...</p>
    </div>
  );
}

function LoadingContent() {
  return (
    <div className="loading-content">
      <div className="loading-section">
        <div className="loading-title"></div>
        <div className="loading-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="loading-card"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorContent({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="error-content">
      <div className="error-icon">⚠️</div>
      <h3>Failed to load activity details</h3>
      <p>{error}</p>
      <button className="retry-button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}
