# Auth0 Integration for Appwrite

## Overview
This folder contains Appwrite Functions for Auth0 OAuth 2.0 integration.

## Functions

### 1. `login.js` - OAuth 2.0 Login Flow
Handles Auth0 authentication:
- Generates authorization URL
- Exchanges code for tokens
- Returns JWT tokens to frontend

**Endpoint:** `POST /functions/auth0-login`

**Request Body:**
```json
{
  "code": "optional_auth_code",
  "state": "optional_state_parameter"
}
```

**Response (Initial):**
```json
{
  "success": true,
  "authorizationUrl": "https://domain/authorize?..."
}
```

**Response (With Code):**
```json
{
  "success": true,
  "accessToken": "...",
  "idToken": "...",
  "expiresIn": 86400
}
```

### 2. `signup.js` - User Registration
Creates new Auth0 users via Management API:
- Validates email/password
- Creates user in Auth0
- Returns user ID and metadata

**Endpoint:** `POST /functions/auth0-signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe",
  "metadata": {}
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

## Configuration

### Required Appwrite Database Setup
Database: `mcp_hub`
Collection: `auth0_projects`
Document: `printHub` (or your project name)

**Required Attributes:**
- `projectName` (String) - Project identifier
- `domain` (String) - Auth0 domain (e.g., ritambharat.jp.auth0.com)
- `clientId` (String) - Auth0 Application ID
- `clientSecret` (Encrypted) - Auth0 Application Secret
- `managementApiEndpoint` (String) - Auth0 Management API URL

### Environment Variables
Set in Appwrite Function Configuration:
- `APPWRITE_ENDPOINT` - Appwrite API endpoint
- `APPWRITE_PROJECT_ID` - Appwrite project ID
- `APPWRITE_API_KEY` - Appwrite API key
- `REDIRECT_URI` - OAuth callback URL (e.g., http://localhost:3000/api/auth/callback)
- `NODE_ENV` - Environment (development/production)

## Deployment

### Using Web Console
1. Go to Appwrite Console → Functions
2. Create new function with Node.js 18.0 runtime
3. Copy-paste code from `login.js` or `signup.js`
4. Set environment variables
5. Click "Deploy"

### Using CLI
```bash
# Install Appwrite CLI
npm install -g appwrite

# Login
appwrite login

# Deploy login function
appwrite functions createDeployment \
  --functionId auth0-login \
  --entrypoint login.js \
  --source ./

# Deploy signup function
appwrite functions createDeployment \
  --functionId auth0-signup \
  --entrypoint signup.js \
  --source ./
```

### Using npm Scripts
```bash
npm run deploy:login
npm run deploy:signup
npm run deploy:all
```

## Usage Example

### Frontend Integration (Next.js)
```typescript
// pages/api/auth/login.ts
export async function GET(req: Request) {
  const { authorizationUrl } = await fetch(
    `${APPWRITE_FUNCTION_URL}/auth0-login`,
    { method: "POST", body: JSON.stringify({}) }
  ).then(r => r.json());

  return Response.redirect(authorizationUrl);
}

// pages/api/auth/callback.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const { accessToken, idToken } = await fetch(
    `${APPWRITE_FUNCTION_URL}/auth0-login`,
    { 
      method: "POST", 
      body: JSON.stringify({ code }) 
    }
  ).then(r => r.json());

  // Store tokens in session
  // Redirect to dashboard
}

// pages/api/auth/signup.ts
export async function POST(req: Request) {
  const { email, password } = await req.json();

  const response = await fetch(
    `${APPWRITE_FUNCTION_URL}/auth0-signup`,
    {
      method: "POST",
      body: JSON.stringify({ email, password })
    }
  ).then(r => r.json());

  return Response.json(response);
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Method Not Allowed` | Using GET instead of POST | Use POST requests |
| `Validation Error` | Missing required fields | Provide email and password |
| `Token Exchange Failed` | Invalid code or redirect_uri | Check callback URL configuration |
| `User Creation Failed` | Email already exists | Use unique email |
| `Internal Server Error` | Database connection failed | Check Appwrite credentials |

## Security Considerations

1. **Client Secret**: Always store in encrypted Appwrite database, never expose to frontend
2. **HTTPS Only**: Use HTTPS URLs in production
3. **CORS**: Configure CORS headers if calling from different domain
4. **Rate Limiting**: Implement rate limiting on signup/login endpoints
5. **Token Expiration**: Always check token expiration before use
6. **State Parameter**: Use state parameter to prevent CSRF attacks

## Related Projects

- **Frontend**: PrintHub Next.js application
- **Database**: Supabase PostgreSQL with RLS
- **Auth Hub**: Centralized Auth0 configuration in Appwrite
- **MCP Platform**: Part of mcp-tools ecosystem

## License

MIT
