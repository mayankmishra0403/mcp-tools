# Auth0 MCP Server Setup Guide

## Overview

**Auth0 MCP Server** is a complete serverless authentication platform running on Appwrite Functions. It provides:

✅ OAuth 2.0 Login Flow
✅ User Signup & Registration
✅ Password Reset
✅ User Profile Management
✅ Management API Access
✅ Complete Admin Controls

## Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (Next.js/React)            │
└────────────────┬────────────────────────────┘
                 │ HTTP Requests
                 ▼
┌─────────────────────────────────────────────┐
│      Appwrite Functions (MCP Server)        │
│                                             │
│  ├── login.js          (OAuth 2.0)         │
│  ├── signup.js         (User Registration) │
│  ├── password-reset.js (Password Reset)    │
│  ├── profile.js        (User Profile)      │
│  ├── server.js         (Server Class)      │
│  └── config.js         (Configuration)     │
└────────────────┬────────────────────────────┘
                 │ HTTPS Requests
                 ▼
┌─────────────────────────────────────────────┐
│   Auth0 (OAuth 2.0 Provider & API)          │
│                                             │
│  ├── Authorization Endpoint                 │
│  ├── Token Endpoint                         │
│  ├── User Info Endpoint                     │
│  └── Management API                         │
└─────────────────────────────────────────────┘
```

## Core Components

### 1. **config.js** - Configuration Manager
Centralized Auth0 configuration retrieval from Appwrite database.

```javascript
const auth0 = new Auth0Config();
await auth0.init("printHub");

auth0.getDomain();                    // Auth0 domain
auth0.getClientId();                  // OAuth client ID
auth0.getClientSecret();              // OAuth client secret
auth0.getManagementApiEndpoint();     // Management API URL
```

### 2. **server.js** - Auth0Server Class
Main server implementation with all OAuth and Management API operations.

```javascript
const auth0 = new Auth0Server();
await auth0.init();

// OAuth Operations
auth0.generateAuthorizationUrl();     // Get login URL
auth0.exchangeCodeForToken(code);     // Exchange code for tokens
auth0.getUserInfo(accessToken);       // Get user info

// User Management
auth0.createUser(email, password);    // Create user
auth0.getUser(userId);                // Get user details
auth0.updateUser(userId, updates);    // Update user
auth0.deleteUser(userId);             // Delete user
auth0.changePassword(userId, pass);   // Change password
auth0.sendPasswordResetEmail(email);  // Send reset email

// Admin Operations
auth0.getManagementToken();           // Get admin token
```

### 3. **Appwrite Functions**

#### login.js
Handles OAuth 2.0 authentication

**Request (Get Authorization URL):**
```json
POST /functions/auth0-login
{
  "state": "random-state-value"
}
```

**Response:**
```json
{
  "success": true,
  "authorizationUrl": "https://domain/authorize?...",
  "state": "random-state-value"
}
```

**Request (Exchange Code):**
```json
POST /functions/auth0-login
{
  "code": "authorization_code_from_callback",
  "state": "random-state-value"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJ0eXAi...",
  "idToken": "eyJ0eXAi...",
  "refreshToken": "eyJ0eXAi...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

#### signup.js
User registration

**Request:**
```json
POST /functions/auth0-signup
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "metadata": {
    "company": "Acme Corp",
    "role": "developer"
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "auth0|...",
    "email": "user@example.com",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User created successfully. Please verify your email."
}
```

#### password-reset.js
Password reset

**Request:**
```json
POST /functions/auth0-password-reset
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent. Please check your inbox.",
  "email": "user@example.com"
}
```

#### profile.js
User profile management

**Get Profile:**
```json
GET /functions/auth0-profile?userId=auth0|... 
// OR
GET /functions/auth0-profile?email=user@example.com
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "auth0|...",
    "email": "user@example.com",
    "emailVerified": true,
    "name": "John Doe",
    "picture": "https://...",
    "nickname": "johndoe",
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "lastLogin": "2024-01-02T10:00:00.000Z"
  }
}
```

**Update Profile:**
```json
PATCH /functions/auth0-profile
{
  "userId": "auth0|...",
  "updates": {
    "user_metadata": {
      "firstName": "Jane",
      "company": "New Company"
    }
  }
}
```

## Deployment Steps

### Step 1: Prerequisites
- Appwrite project with functions enabled
- Auth0 account with application credentials
- Appwrite database `mcp_hub` with `auth0_projects` collection

### Step 2: Create Appwrite Functions

#### 2.1 Create login function
```bash
# Go to Appwrite Console → Functions → Create Function
Name: auth0-login
Runtime: Node.js 18.0
```

Copy content from `login.js` and deploy.

#### 2.2 Create signup function
```bash
Name: auth0-signup
Runtime: Node.js 18.0
```

Copy content from `signup.js` and deploy.

#### 2.3 Create password-reset function
```bash
Name: auth0-password-reset
Runtime: Node.js 18.0
```

Copy content from `password-reset.js` and deploy.

#### 2.4 Create profile function
```bash
Name: auth0-profile
Runtime: Node.js 18.0
```

Copy content from `profile.js` and deploy.

### Step 3: Set Environment Variables

For each function, set these environment variables in Appwrite Console:

```env
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
REDIRECT_URI=http://localhost:3000/api/auth/callback
NODE_ENV=production
```

### Step 4: Verify Appwrite Database Setup

Ensure `mcp_hub` database has `auth0_projects` collection with document `printHub`:

```json
{
  "projectName": "printHub",
  "domain": "ritambharat.jp.auth0.com",
  "clientId": "JqvWx2irDcCaWHYXr3bJcH0JpJBokKax",
  "clientSecret": "[ENCRYPTED]",
  "managementApiEndpoint": "https://ritambharat.jp.auth0.com/api/v2/"
}
```

## Integration with Frontend (Next.js)

### Example: Login Flow

```typescript
// pages/api/auth/init.ts
export async function GET(req: Request) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APPWRITE_URL}/functions/auth0-login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: crypto.randomUUID() })
    }
  );

  const { authorizationUrl } = await response.json();
  return Response.redirect(authorizationUrl);
}

// pages/api/auth/callback.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APPWRITE_URL}/functions/auth0-login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    }
  );

  const { accessToken, idToken } = await response.json();
  
  // Store tokens in session/cookies
  // Redirect to dashboard
}
```

## Security Best Practices

1. **Never expose secrets in frontend** - Always use backend API
2. **Use HTTPS only** - Always use secure connections
3. **Validate CSRF** - Use state parameter in OAuth flow
4. **Secure storage** - Store tokens in httpOnly cookies
5. **Rate limiting** - Implement rate limiting on functions
6. **Input validation** - Always validate and sanitize inputs
7. **Error handling** - Don't expose sensitive errors to frontend

## Troubleshooting

### "Config not initialized"
- Check if environment variables are set
- Verify Appwrite database and collection exist
- Verify Auth0 credentials in database document

### "Token exchange failed"
- Check if authorization code is valid
- Verify redirect_uri matches Auth0 configuration
- Check client_id and client_secret are correct

### "User creation failed"
- Email might already exist
- Password doesn't meet Auth0 requirements
- Check Auth0 connection settings

### "Management API token failed"
- Verify client credentials in database
- Check if Management API is enabled in Auth0
- Verify API audience is correct

## Files Structure

```
appwrite/auth0/
├── config.js              # Configuration manager
├── server.js              # Auth0Server class (main logic)
├── login.js               # OAuth 2.0 login function
├── signup.js              # User signup function
├── password-reset.js      # Password reset function
├── profile.js             # User profile function
├── package.json           # Dependencies
└── README.md              # Documentation
```

## Next Steps

1. ✅ Deploy all functions to Appwrite
2. ✅ Test OAuth flow with frontend
3. ✅ Implement token refresh mechanism
4. ✅ Add email verification
5. ✅ Add two-factor authentication
6. ✅ Add social login (Google, GitHub)

## Support & Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Appwrite Functions](https://appwrite.io/docs/products/functions)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [GitHub Repository](https://github.com/mayankmishra0403/mcp-tools)

---

**Created:** December 2024
**Status:** Production Ready ✅
**Last Updated:** December 27, 2024
