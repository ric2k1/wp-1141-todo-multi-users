# OAuth Setup Guide

This guide will help you set up OAuth authentication with Google, GitHub, and Facebook for the Todo Multi-Users application.

## Overview

The application uses NextAuth.js v5 for OAuth authentication. Users must be pre-registered by an administrator before they can login using their OAuth provider.

## Prerequisites

1. Working Next.js application
2. PostgreSQL database configured
3. Environment variables set up

## OAuth Provider Setup

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to "APIs & Services" → "Credentials"
4. Configure OAuth consent screen first if prompted:
   - Choose "External" user type (unless you have Google Workspace)
   - Fill in app name, user support email, and developer email
   - Add scopes: `email`, `profile`, `openid`
5. Create OAuth client ID:
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret to your `.env` file

### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Todo Multi-Users
   - **Homepage URL**: `http://localhost:3000` (development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy Client ID and generate Client Secret
6. Add to your `.env` file

### 3. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add Facebook Login product
4. Go to Facebook Login → Settings
5. Add valid OAuth redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook` (development)
   - `https://yourdomain.com/api/auth/callback/facebook` (production)
6. Copy App ID and App Secret to your `.env` file

## Environment Variables

Update your `.env` file with the OAuth credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/todo_multi_users?schema=public"

# NextAuth (generate your own secret!)
NEXTAUTH_SECRET="your-generated-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
```

## User Management

### Adding Users

Use the command-line script to add users:

```bash
# Add a user with Google OAuth
./todo-add-user.sh add john google

# Add a user with GitHub OAuth
./todo-add-user.sh add alice github

# Add a user with Facebook OAuth
./todo-add-user.sh add bob facebook
```

### Removing Users

```bash
# Remove a user
./todo-add-user.sh remove john
```

### Listing Users

```bash
# List all registered users
./todo-add-user.sh list
```

## Authentication Flow

1. **User visits the application** → Redirected to `/login`
2. **User enters username** → System looks up their OAuth provider
3. **User clicks login** → Redirected to OAuth provider (Google/GitHub/Facebook)
4. **OAuth provider authenticates** → User redirected back to application
5. **Application checks user exists** → If yes, user is logged in; if no, access denied

## Important Notes

- **Pre-registration Required**: Users must be added via the command-line script before they can login
- **Username Matching**: The username in the database must match the name returned by the OAuth provider
- **Provider Matching**: Users can only login with the OAuth provider they were registered with
- **No Email Required**: The system uses usernames, not email addresses for identification

## Troubleshooting

### Common Issues

1. **"User not found" error**

   - Make sure the user is registered using `./todo-add-user.sh add <name> <provider>`
   - Check that the username matches exactly (case-sensitive)

2. **OAuth redirect errors**

   - Verify redirect URIs are correctly configured in OAuth provider settings
   - Check that NEXTAUTH_URL matches your current domain

3. **Environment variable errors**

   - Ensure all OAuth credentials are properly set in `.env`
   - Restart the development server after changing environment variables

4. **Database connection errors**
   - Verify DATABASE_URL is correct
   - Run database migrations: `yarn db:migrate`

### Testing

1. **Add a test user**:

   ```bash
   ./todo-add-user.sh add testuser google
   ```

2. **Visit the application**: `http://localhost:3000`

3. **Login flow**:
   - Enter "testuser" as username
   - Click "Login"
   - Should redirect to Google OAuth
   - After successful OAuth, should redirect back to main application

## Security Considerations

- Keep OAuth client secrets secure and never commit them to version control
- Use strong, unique values for NEXTAUTH_SECRET
- Consider using environment-specific OAuth applications for development vs production
- Regularly rotate OAuth credentials
- Monitor failed authentication attempts

## Production Deployment

1. Update OAuth provider redirect URIs to production URLs
2. Set production environment variables
3. Use secure HTTPS URLs for all OAuth callbacks
4. Configure proper CORS settings if needed
5. Set up proper logging and monitoring for authentication events
