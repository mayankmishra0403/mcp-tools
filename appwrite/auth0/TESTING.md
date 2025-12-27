# Auth0 MCP Server Testing Guide

## Overview

Complete testing guide for Auth0 MCP Server functions in Appwrite.

## Prerequisites

- Appwrite functions deployed and accessible
- Auth0 credentials configured in Appwrite database
- curl or Postman installed for API testing

## Test Environment Setup

### 1. Get Function URLs

After deploying to Appwrite, you'll have URLs like:
```
https://your-appwrite-domain/functions/auth0-login
https://your-appwrite-domain/functions/auth0-signup
https://your-appwrite-domain/functions/auth0-password-reset
https://your-appwrite-domain/functions/auth0-profile
```

### 2. Set Environment Variables for Testing

```bash
export APPWRITE_FUNCTION_URL="https://your-appwrite-domain/functions"
export TEST_EMAIL="test+$(date +%s)@example.com"
export TEST_PASSWORD="TestPassword123!"
```

## Test Cases

### Test 1: Generate Authorization URL

**Endpoint:** `POST /auth0-login`

**Request:**
```bash
curl -X POST "$APPWRITE_FUNCTION_URL/auth0-login" \
  -H "Content-Type: application/json" \
  -d '{
    "state": "random-state-12345"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "authorizationUrl": "https://domain/authorize?client_id=...&redirect_uri=...&response_type=code&scope=openid+profile+email&state=random-state-12345",
  "state": "random-state-12345"
}
```

**What it tests:**
- ✅ Auth0Server initialization
- ✅ Configuration retrieval from Appwrite DB
- ✅ Authorization URL generation
- ✅ State parameter handling

---

### Test 2: Create User (Sign Up)

**Endpoint:** `POST /auth0-signup`

**Request:**
```bash
curl -X POST "$APPWRITE_FUNCTION_URL/auth0-signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"metadata\": {
      \"company\": \"Acme Corp\",
      \"role\": \"developer\"
    }
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "userId": "auth0|507f1f77bcf86cd799439011",
    "email": "test+1703693420@example.com",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User created successfully. Please verify your email."
}
```

**What it tests:**
- ✅ Management API token generation
- ✅ User creation in Auth0
- ✅ Metadata handling
- ✅ Error handling for duplicate emails

**Error Test:**
```bash
# Try creating with same email again
curl -X POST "$APPWRITE_FUNCTION_URL/auth0-signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"existing@example.com\",
    \"password\": \"$TEST_PASSWORD\"
  }"

# Expected: 400 error with "User already exists"
```

---

### Test 3: Get User Profile

**Endpoint:** `GET /auth0-profile`

**Request (by User ID):**
```bash
USER_ID="auth0|507f1f77bcf86cd799439011"

curl -X GET "$APPWRITE_FUNCTION_URL/auth0-profile?userId=$USER_ID" \
  -H "Content-Type: application/json"
```

**Request (by Email):**
```bash
curl -X GET "$APPWRITE_FUNCTION_URL/auth0-profile?email=$TEST_EMAIL" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "userId": "auth0|507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "emailVerified": false,
    "name": "Test User",
    "picture": "https://...",
    "nickname": "testuser",
    "metadata": {
      "company": "Acme Corp",
      "role": "developer"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "lastLogin": "2024-01-02T10:00:00.000Z"
  }
}
```

**What it tests:**
- ✅ User retrieval by ID
- ✅ User search by email
- ✅ Profile data structure

---

### Test 4: Update User Profile

**Endpoint:** `PATCH /auth0-profile`

**Request:**
```bash
curl -X PATCH "$APPWRITE_FUNCTION_URL/auth0-profile" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"auth0|507f1f77bcf86cd799439011\",
    \"updates\": {
      \"user_metadata\": {
        \"firstName\": \"Updated\",
        \"company\": \"New Company\",
        \"role\": \"senior-developer\"
      }
    }
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "userId": "auth0|507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "emailVerified": false,
    "metadata": {
      "firstName": "Updated",
      "company": "New Company",
      "role": "senior-developer"
    },
    "updatedAt": "2024-01-03T00:00:00.000Z"
  }
}
```

**What it tests:**
- ✅ User update via Management API
- ✅ Metadata update
- ✅ Updated timestamp

---

### Test 5: Password Reset

**Endpoint:** `POST /auth0-password-reset`

**Request:**
```bash
curl -X POST "$APPWRITE_FUNCTION_URL/auth0-password-reset" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset email sent. Please check your inbox.",
  "email": "test@example.com"
}
```

**What it tests:**
- ✅ Password reset email sending
- ✅ Auth0 ticket generation
- ✅ Email delivery

---

### Test 6: OAuth Code Exchange

**Endpoint:** `POST /auth0-login`

**Setup:**
1. Get authorization URL from Test 1
2. Open URL in browser
3. Login with Auth0 credentials
4. Get authorization code from callback URL

**Request:**
```bash
AUTH_CODE="your_auth_code_from_callback"

curl -X POST "$APPWRITE_FUNCTION_URL/auth0-login" \
  -H "Content-Type: application/json" \
  -d "{
    \"code\": \"$AUTH_CODE\",
    \"state\": \"random-state-12345\"
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "idToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

**What it tests:**
- ✅ Authorization code validation
- ✅ Token exchange
- ✅ JWT token generation
- ✅ Token expiration handling

---

## Error Testing

### Test Invalid Email Format

```bash
curl -X POST "$APPWRITE_FUNCTION_URL/auth0-signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "TestPassword123!"
  }'

# Expected: 400 Bad Request
# Response: { "error": "Validation Error" }
```

### Test Missing Password

```bash
curl -X POST "$APPWRITE_FUNCTION_URL/auth0-signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# Expected: 400 Bad Request
# Response: { "error": "Validation Error", "message": "Email and password are required" }
```

### Test Invalid Method

```bash
curl -X GET "$APPWRITE_FUNCTION_URL/auth0-login" \
  -H "Content-Type: application/json"

# Expected: 405 Method Not Allowed
# Response: { "error": "Method Not Allowed", "message": "Only POST requests are allowed" }
```

### Test Missing Configuration

```bash
# This will fail if APPWRITE_API_KEY or database credentials are missing
# Expected: 500 Internal Server Error
# Response: { "error": "Authentication Error", "message": "Config not initialized" }
```

---

## Load Testing

### Using Apache Bench

```bash
# Test login endpoint with 100 requests
ab -n 100 -c 10 -p test_payload.json -T application/json \
  "$APPWRITE_FUNCTION_URL/auth0-login"
```

### Using wrk

```bash
# Create test.lua script
cat > test.lua << 'LUA'
request = function()
  wrk.headers["Content-Type"] = "application/json"
  wrk.body = '{"state": "test-state"}'
  return wrk.format(nil, "/auth0-login")
end
LUA

# Run test
wrk -t 4 -c 100 -d 30s -s test.lua \
  https://your-appwrite-domain/functions
```

---

## Integration Testing

### Test OAuth Flow End-to-End

```javascript
// test-oauth-flow.js
async function testOAuthFlow() {
  const BASE_URL = process.env.APPWRITE_FUNCTION_URL;

  // Step 1: Get authorization URL
  console.log("Step 1: Getting authorization URL...");
  const authRes = await fetch(`${BASE_URL}/auth0-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'test-state' })
  });
  
  const { authorizationUrl } = await authRes.json();
  console.log("✅ Authorization URL:", authorizationUrl);

  // Step 2: User authenticates (manual step in browser)
  console.log("\nStep 2: Open in browser and authenticate");
  console.log(authorizationUrl);

  // Step 3: Exchange code for tokens (after browser redirect)
  // console.log("\nStep 3: Exchanging code for tokens...");
  // const tokenRes = await fetch(`${BASE_URL}/auth0-login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ code: authCode, state: 'test-state' })
  // });
  // const tokens = await tokenRes.json();
  // console.log("✅ Tokens received:", tokens);
}

testOAuthFlow().catch(console.error);
```

---

## Success Criteria

Each function deployment is successful when:

✅ Function is accessible via HTTP
✅ Accepts correct HTTP method (POST/GET/PATCH)
✅ Returns JSON response with proper structure
✅ Returns correct status codes (200, 201, 400, 405, 500)
✅ Handles errors gracefully
✅ Logs operations properly
✅ Connects to Auth0 successfully
✅ Manages tokens correctly

---

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `Config not initialized` | APPWRITE_API_KEY not set | Set environment variables in Appwrite Console |
| `Failed to initialize Auth0 config` | Database credentials invalid | Verify mcp_hub database and auth0_projects collection |
| `Token exchange failed` | Invalid authorization code | Verify redirect_uri matches Auth0 settings |
| `User already exists` | Email already registered | Use unique email for testing |
| `Failed to get management token` | Invalid client credentials | Check Auth0 application credentials |
| `CORS error` | Cross-origin request blocked | Configure CORS headers in Appwrite |

---

## Next Steps

After successful testing:

1. ✅ Deploy to production
2. ✅ Configure monitoring and logging
3. ✅ Setup alerts for errors
4. ✅ Integrate with PrintHub frontend
5. ✅ Create automated test suite

---

**Created:** December 2024
**Last Updated:** December 27, 2024
**Status:** Testing Guide Complete ✅
