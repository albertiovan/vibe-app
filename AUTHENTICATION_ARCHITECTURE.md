# Authentication System Architecture

## Overview
Full authentication system with email/password and OAuth (Google, Apple) for the Vibe app.

## Authentication Flow

### Onboarding Screen
```
┌─────────────────────────────────┐
│     Welcome to Vibe App         │
│                                 │
│  [Continue with Google]         │
│  [Continue with Apple]          │
│  [Continue with Email]          │
│                                 │
│  Already have an account?       │
│  [Log In]                       │
└─────────────────────────────────┘
```

## Database Schema

### `users` table (extend existing)
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(auth_provider, provider_id);
```

### `auth_tokens` table (new)
```sql
CREATE TABLE auth_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  refresh_token VARCHAR(500) UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_auth_tokens_user ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_device ON auth_tokens(device_id);
```

### `password_resets` table (new)
```sql
CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_resets_token ON password_resets(token);
```

## Backend API Routes

### Authentication Endpoints

#### POST `/api/auth/register`
Create new account with email/password
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "deviceId": "device-uuid"
}

Response:
{
  "user": { "id": 1, "email": "...", "fullName": "..." },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### POST `/api/auth/login`
Login with email/password
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "deviceId": "device-uuid"
}

Response:
{
  "user": { "id": 1, "email": "...", "fullName": "..." },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### POST `/api/auth/oauth/google`
Google OAuth authentication
```json
Request:
{
  "idToken": "google-id-token",
  "deviceId": "device-uuid"
}

Response:
{
  "user": { "id": 1, "email": "...", "fullName": "..." },
  "token": "jwt-token",
  "refreshToken": "refresh-token",
  "isNewUser": true
}
```

#### POST `/api/auth/oauth/apple`
Apple Sign In authentication
```json
Request:
{
  "identityToken": "apple-identity-token",
  "authorizationCode": "apple-auth-code",
  "user": { "email": "...", "fullName": "..." },
  "deviceId": "device-uuid"
}

Response:
{
  "user": { "id": 1, "email": "...", "fullName": "..." },
  "token": "jwt-token",
  "refreshToken": "refresh-token",
  "isNewUser": true
}
```

#### POST `/api/auth/refresh`
Refresh access token
```json
Request:
{
  "refreshToken": "refresh-token"
}

Response:
{
  "token": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

#### POST `/api/auth/logout`
Logout and invalidate tokens
```json
Request:
{
  "token": "jwt-token"
}

Response:
{
  "success": true
}
```

#### POST `/api/auth/forgot-password`
Request password reset
```json
Request:
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### POST `/api/auth/reset-password`
Reset password with token
```json
Request:
{
  "token": "reset-token",
  "newPassword": "NewSecurePass123!"
}

Response:
{
  "success": true
}
```

#### GET `/api/auth/verify-email/:token`
Verify email address
```
Response: Redirect to app with success/error
```

## Security Implementation

### Password Hashing
- Use `bcrypt` with 10 rounds
- Never store plain text passwords

### JWT Tokens
- Access token: 15 minutes expiration
- Refresh token: 30 days expiration
- Sign with `HS256` algorithm
- Store secret in environment variables

### OAuth Security
- Verify tokens with provider APIs
- Store provider ID for account linking
- Handle email conflicts (same email, different providers)

## Frontend Implementation

### React Native Screens

#### 1. `WelcomeScreen.tsx`
- App logo and tagline
- "Continue with Google" button
- "Continue with Apple" button
- "Continue with Email" button
- "Already have an account? Log In" link

#### 2. `EmailSignUpScreen.tsx`
- Email input
- Password input (with strength indicator)
- Full name input
- "Create Account" button
- "Already have an account? Log In" link

#### 3. `LoginScreen.tsx`
- Email input
- Password input
- "Log In" button
- "Forgot Password?" link
- "Don't have an account? Sign Up" link

#### 4. `ForgotPasswordScreen.tsx`
- Email input
- "Send Reset Link" button
- Success message

#### 5. `ResetPasswordScreen.tsx`
- New password input
- Confirm password input
- "Reset Password" button

### OAuth Libraries
- **Google**: `@react-native-google-signin/google-signin`
- **Apple**: `@invertase/react-native-apple-authentication`

### Storage
- Store tokens in `AsyncStorage`
- Auto-refresh on app launch
- Clear on logout

## Migration from Device ID System

### Backward Compatibility
1. Keep existing `device_id` system working
2. Link device IDs to user accounts on first login
3. Migrate user data when account is created

### Migration Strategy
```sql
-- Link existing device data to new user account
UPDATE user_preferences 
SET user_id = $1 
WHERE device_id = $2;

UPDATE saved_activities 
SET user_id = $1 
WHERE device_id = $2;

UPDATE friendships 
SET user_id = $1 
WHERE device_id = $2;
```

## Environment Variables

### Backend `.env.production`
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# OAuth - Google
GOOGLE_CLIENT_ID_IOS=your-ios-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=your-android-client-id.apps.googleusercontent.com

# OAuth - Apple
APPLE_CLIENT_ID=com.yourapp.vibe
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY_PATH=/path/to/AuthKey.p8

# Email Service (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@vibeapp.com
```

## Testing Strategy

### Unit Tests
- Password hashing/verification
- JWT token generation/validation
- OAuth token verification

### Integration Tests
- Registration flow
- Login flow
- OAuth flows (Google, Apple)
- Token refresh
- Password reset

### E2E Tests
- Complete onboarding flow
- Login with existing account
- OAuth sign-in
- Multi-device login

## Rollout Plan

### Phase 1: Backend (1-2 days)
1. Create database migrations
2. Implement auth routes
3. Add JWT middleware
4. Test with Postman/curl

### Phase 2: Frontend (2-3 days)
1. Create auth screens
2. Implement OAuth providers
3. Add token storage
4. Test flows

### Phase 3: Migration (1 day)
1. Add device ID linking
2. Migrate existing users
3. Test backward compatibility

### Phase 4: Deployment (1 day)
1. Deploy to EC2
2. Configure OAuth credentials
3. Test in production

## Cost Considerations

### Additional Services
- **Email Service**: SendGrid free tier (100 emails/day) or Gmail SMTP (free)
- **OAuth**: Free (Google, Apple)
- **No additional AWS costs**

## Security Best Practices

1. ✅ HTTPS only (enforce in production)
2. ✅ Rate limiting on auth endpoints
3. ✅ Password strength requirements
4. ✅ Email verification
5. ✅ Secure token storage
6. ✅ CSRF protection
7. ✅ SQL injection prevention (parameterized queries)
8. ✅ XSS prevention (input sanitization)

## Next Steps

1. Create database migration for auth tables
2. Implement backend auth service
3. Create auth API routes
4. Set up OAuth providers (Google, Apple)
5. Create frontend auth screens
6. Test authentication flows
7. Deploy to EC2
8. Configure production OAuth credentials
9. Build for TestFlight

---

**Estimated Implementation Time**: 4-6 days
**Complexity**: Medium-High
**Dependencies**: OAuth provider setup, email service configuration
