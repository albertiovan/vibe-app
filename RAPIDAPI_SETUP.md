# RapidAPI TripAdvisor Setup Guide

This guide explains how to configure the RapidAPI TripAdvisor integration for the Vibe app.

## Prerequisites

1. **RapidAPI Account**: Sign up at [rapidapi.com](https://rapidapi.com)
2. **TripAdvisor API Subscription**: Subscribe to a TripAdvisor API provider

## Recommended TripAdvisor API Provider

We recommend using **Travel Advisor by apidojo** on RapidAPI:
- **URL**: https://rapidapi.com/apidojo/api/travel-advisor
- **Host**: `travel-advisor.p.rapidapi.com`
- **Base URL**: `https://travel-advisor.p.rapidapi.com`

## Environment Configuration

### 1. Copy Environment Template

```bash
cp backend/.env.example backend/.env
```

### 2. Configure RapidAPI Credentials

Edit `backend/.env` and set the following variables:

```env
# RapidAPI TripAdvisor Configuration
RAPIDAPI_KEY=your_rapidapi_key_here
TRIPADVISOR_RAPIDAPI_HOST=travel-advisor.p.rapidapi.com
TRIPADVISOR_BASE_URL=https://travel-advisor.p.rapidapi.com
```

### 3. Get Your RapidAPI Key

1. Go to [RapidAPI Hub](https://rapidapi.com/hub)
2. Sign in to your account
3. Navigate to your subscribed TripAdvisor API
4. Copy the `X-RapidAPI-Key` from the code examples
5. Paste it as the `RAPIDAPI_KEY` value in your `.env` file

## Testing the Integration

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

### 2. Test API Connectivity

Test TripAdvisor API connectivity:
```bash
curl http://localhost:3000/api/ping/tripadvisor
```

Test all external APIs:
```bash
curl http://localhost:3000/api/ping/all
```

### 3. Expected Responses

**With valid API key:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "provider": "TripAdvisor (travel-advisor.p.rapidapi.com)",
    "timestamp": "2025-10-16T14:54:21.692Z",
    "quotaHeaders": {
      "x-ratelimit-requests-remaining": "999"
    },
    "sampleData": {
      "status": 200,
      "dataLength": 1,
      "firstResult": "Paris"
    },
    "duration": "245ms"
  },
  "message": "TripAdvisor API is accessible"
}
```

**Without API key:**
```json
{
  "success": false,
  "data": {
    "ok": false,
    "provider": "TripAdvisor (travel-advisor.p.rapidapi.com)",
    "timestamp": "2025-10-16T14:54:21.692Z",
    "quotaHeaders": {},
    "sampleData": {
      "error": "RapidAPI client not configured"
    },
    "duration": "0ms"
  },
  "message": "TripAdvisor API is not accessible"
}
```

## API Client Features

The RapidAPI client includes:

- ✅ **Typed responses** with TypeScript interfaces
- ✅ **Automatic retries** and error handling
- ✅ **Request/response logging** (development only)
- ✅ **Timeout protection** (8 second default)
- ✅ **Quota monitoring** via response headers
- ✅ **Graceful degradation** when API key is missing

## Available Endpoints

### Health Check Endpoints

- `GET /api/ping/tripadvisor` - Test TripAdvisor API connectivity
- `GET /api/ping/all` - Test all external API connectivity

### TripAdvisor Service Methods

- `tripAdvisorService.ping()` - Health check with sample API call
- `tripAdvisorService.searchActivities(location, categories?, limit?)` - Search for activities

## Troubleshooting

### Common Issues

1. **"RapidAPI client not configured"**
   - Check that `RAPIDAPI_KEY` is set in your `.env` file
   - Verify the API key is correct (no extra spaces)

2. **"Request timeout"**
   - Check your internet connection
   - Verify the RapidAPI service is not down

3. **"HTTP 403 Forbidden"**
   - Verify your RapidAPI subscription is active
   - Check that you haven't exceeded your quota limits

4. **"HTTP 404 Not Found"**
   - Verify the `TRIPADVISOR_RAPIDAPI_HOST` matches your subscribed API
   - Check the endpoint URLs in the API documentation

### Debug Logging

In development mode, the client logs detailed request/response information:

```bash
# Start server with debug logging
NODE_ENV=development npm run dev
```

Look for log messages like:
- `🔌 RapidAPI Client initialized`
- `📡 RapidAPI GET https://...`
- `✅ RapidAPI GET 200 (245ms)`
- `🏓 TripAdvisor ping result`

## Security Notes

- ✅ **Never commit** your `.env` file to version control
- ✅ **Use different API keys** for development and production
- ✅ **Monitor your quota usage** to avoid unexpected charges
- ✅ **Rotate API keys** periodically for security

## Production Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Use a secure secrets management system
3. Monitor API usage and set up alerts
4. Configure appropriate rate limiting

## Support

If you encounter issues:

1. Check the [RapidAPI documentation](https://docs.rapidapi.com/)
2. Review your API subscription status
3. Test the ping endpoints for connectivity
4. Check server logs for detailed error messages
