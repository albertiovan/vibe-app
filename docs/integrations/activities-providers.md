# Activities Providers Research & Integration

## Overview
Research and integration plan for real-time activities providers to replace mock data with live experiences, tours, and events.

## Provider Comparison

### 1. Viator (TripAdvisor Experiences)
**Status**: ✅ **Recommended Primary**  
**Coverage**: Global, strong in Europe  
**Specialty**: Tours, experiences, attractions

#### API Capabilities:
- **Search**: ✅ By location, category, date
- **Details**: ✅ Full activity information
- **Availability**: ✅ Real-time availability
- **Reviews**: ✅ TripAdvisor reviews integration
- **Booking**: ✅ Full booking flow
- **Photos**: ✅ High-quality images

#### Endpoints:
```
GET /v1/taxonomy/destinations - Get destinations
GET /v1/search/products - Search activities
GET /v1/product/{productCode} - Get product details
GET /v1/product/{productCode}/reviews - Get reviews
GET /v1/booking/availability - Check availability
POST /v1/booking/book - Create booking
```

#### Sample Request (Bucharest):
```bash
GET /v1/search/products?dest=6094&topX=20&sortOrder=REVIEW_AVG_RATING_D
Headers:
  exp-api-key: {API_KEY}
  Accept-Language: en-US
  Accept: application/json;version=2.0
```

#### Sample Response:
```json
{
  "data": [
    {
      "productCode": "5449BUCHAREST",
      "title": "Bucharest City Walking Tour",
      "shortDescription": "Discover Bucharest's history...",
      "duration": "PT3H",
      "price": {
        "amount": 25.00,
        "currency": "EUR"
      },
      "rating": 4.5,
      "reviewCount": 342,
      "primaryDestinationName": "Bucharest",
      "images": [...]
    }
  ]
}
```

### 2. GetYourGuide
**Status**: ✅ **Recommended Secondary**  
**Coverage**: Strong in Europe, growing globally  
**Specialty**: Tours, activities, skip-the-line tickets

#### API Capabilities:
- **Search**: ✅ By location, category
- **Details**: ✅ Comprehensive information
- **Availability**: ✅ Real-time slots
- **Reviews**: ✅ Verified reviews
- **Booking**: ✅ Partner booking
- **Photos**: ✅ Professional photography

#### Endpoints:
```
GET /v1/tours - Search tours
GET /v1/tours/{id} - Get tour details
GET /v1/tours/{id}/availability - Check availability
GET /v1/tours/{id}/reviews - Get reviews
POST /v1/bookings - Create booking
```

#### Romania Coverage:
- **Bucharest**: 150+ activities
- **Brașov**: 80+ activities  
- **Cluj-Napoca**: 45+ activities
- **Constanța**: 30+ activities

### 3. Musement
**Status**: ⚠️ **Evaluation Needed**  
**Coverage**: Good European coverage  
**Specialty**: Cultural experiences, museums

#### API Capabilities:
- **Search**: ✅ By city, category
- **Details**: ✅ Rich content
- **Availability**: ✅ Calendar-based
- **Reviews**: ✅ User reviews
- **Booking**: ✅ Direct booking
- **Photos**: ✅ Editorial quality

#### Endpoints:
```
GET /api/v3/cities/{id}/activities - Get city activities
GET /api/v3/activities/{id} - Get activity details
GET /api/v3/activities/{id}/dates - Get availability
GET /api/v3/activities/{id}/reviews - Get reviews
```

### 4. OpenTripMap (POIs)
**Status**: ✅ **Supplemental for POIs**  
**Coverage**: Global POI database  
**Specialty**: Points of interest, historical sites

#### API Capabilities:
- **Search**: ✅ By coordinates, radius
- **Details**: ✅ Wikipedia integration
- **Availability**: ❌ Static POIs
- **Reviews**: ❌ No reviews
- **Booking**: ❌ Information only
- **Photos**: ⚠️ Limited

#### Endpoints:
```
GET /0.1/en/places/radius - Search by radius
GET /0.1/en/places/xid/{xid} - Get POI details
GET /0.1/en/places/bbox - Search by bounding box
```

#### Sample Request (Bucharest POIs):
```bash
GET /0.1/en/places/radius?radius=10000&lon=26.1025&lat=44.4268&kinds=interesting_places&limit=20
Headers:
  apikey: {API_KEY}
```

### 5. Eventbrite (Events)
**Status**: ✅ **Supplemental for Events**  
**Coverage**: Global events platform  
**Specialty**: Live events, workshops, conferences

#### API Capabilities:
- **Search**: ✅ By location, date, category
- **Details**: ✅ Event information
- **Availability**: ✅ Ticket availability
- **Reviews**: ❌ No reviews
- **Booking**: ✅ Ticket purchasing
- **Photos**: ✅ Event photos

#### Endpoints:
```
GET /v3/events/search/ - Search events
GET /v3/events/{id}/ - Get event details
GET /v3/events/{id}/ticket_classes/ - Get ticket types
POST /v3/orders/ - Create order
```

## Integration Strategy

### Phase 1: Foundation (Current)
- ✅ Domain models defined
- ✅ Provider interface created
- ✅ Configuration system ready
- ✅ Feature flags implemented

### Phase 2: Primary Provider (Viator)
- [ ] Implement Viator adapter
- [ ] Add Bucharest-specific endpoints
- [ ] Integrate with existing activities service
- [ ] Add comprehensive error handling

### Phase 3: Multi-Provider Support
- [ ] Add GetYourGuide adapter
- [ ] Implement provider aggregation
- [ ] Add fallback mechanisms
- [ ] Performance optimization

### Phase 4: Supplemental Data
- [ ] Add OpenTripMap for POIs
- [ ] Add Eventbrite for events
- [ ] Merge different data types
- [ ] Enhanced categorization

### Phase 5: Advanced Features
- [ ] Real-time availability
- [ ] Booking capabilities
- [ ] Review aggregation
- [ ] Price comparison

## Provider Selection Criteria

### For Bucharest/Romania:
1. **Viator** - Best overall coverage and quality
2. **GetYourGuide** - Strong European presence
3. **Musement** - Cultural focus
4. **OpenTripMap** - Free POI data
5. **Eventbrite** - Live events

### Scoring Matrix:
| Provider | Coverage | Quality | API | Cost | Total |
|----------|----------|---------|-----|------|-------|
| Viator | 9/10 | 9/10 | 8/10 | 6/10 | 32/40 |
| GetYourGuide | 8/10 | 8/10 | 9/10 | 7/10 | 32/40 |
| Musement | 7/10 | 8/10 | 7/10 | 8/10 | 30/40 |
| OpenTripMap | 6/10 | 6/10 | 8/10 | 10/10 | 30/40 |
| Eventbrite | 8/10 | 7/10 | 8/10 | 9/10 | 32/40 |

## Implementation Plan

### Immediate Next Steps:
1. **Get API Keys**: Apply for Viator Partner API access
2. **Implement Viator Adapter**: Create first real provider
3. **Test with Bucharest**: Verify data quality and coverage
4. **Gradual Rollout**: Feature flag controlled deployment

### Success Metrics:
- **Coverage**: >100 activities in Bucharest
- **Quality**: Average rating >4.0
- **Performance**: <2s response time
- **Reliability**: >99% uptime

### Risk Mitigation:
- **Fallback**: Always maintain mock provider
- **Rate Limits**: Implement proper throttling
- **Costs**: Monitor API usage closely
- **Quality**: Validate data before serving

## Configuration Examples

### Production Environment:
```env
ACTIVITIES_PROVIDER=viator
FEATURE_REAL_TIME_PROVIDERS=true
VIATOR_API_KEY=prod_key_here
GYG_API_KEY=backup_key_here
FEATURE_MULTI_PROVIDER=true
```

### Development Environment:
```env
ACTIVITIES_PROVIDER=mock
FEATURE_REAL_TIME_PROVIDERS=false
VIATOR_API_KEY=test_key_here
```

## Testing Strategy

### Unit Tests:
- Provider interface compliance
- Error handling scenarios
- Data transformation accuracy

### Integration Tests:
- Real API connectivity
- Fallback mechanisms
- Performance benchmarks

### End-to-End Tests:
- Complete user journeys
- Multi-provider scenarios
- Error recovery flows
