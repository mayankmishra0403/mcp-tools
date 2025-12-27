# Quick Start - Deploy & Test Auth0 MCP Server

Complete step-by-step guide to deploy and test Auth0 MCP Server in 15 minutes.

## Prerequisites

✅ Appwrite account (fra.cloud.appwrite.io)
✅ Auth0 account with application credentials
✅ Appwrite database `mcp_hub` created
✅ Document `printHub` with Auth0 config

## 5-Minute Deployment

### Step 1: Go to Appwrite Console
```
https://cloud.appwrite.io → Select Project
```

### Step 2: Create Function 1 - auth0-login
1. **Functions** → **Create Function**
2. **Name:** `auth0-login`
3. **Runtime:** Node.js 18.0
4. **Create**
5. Copy code from `login.js` into editor
6. **Settings** → Set environment variables:
   ```
   APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=694ffb380028abb32fd2
   APPWRITE_API_KEY=[your-api-key]
   REDIRECT_URI=http://localhost:3000/api/auth/callback
   NODE_ENV=development
   ```
7. **Deploy**

### Step 3: Create Function 2 - auth0-signup
1. Repeat Step 2 with:
   - **Name:** `auth0-signup`
   - **Code:** Copy from `signup.js`

### Step 4: Create Function 3 - auth0-password-reset
1. Repeat Step 2 with:
   - **Name:** `auth0-password-reset`
   - **Code:** Copy from `password-reset.js`

### Step 5: Create Function 4 - auth0-profile
1. Repeat Step 2 with:
   - **Name:** `auth0-profile`
   - **Code:** Copy from `profile.js`

**Done! ✅ All functions deployed**

## 10-Minute Testing

### Test 1: Check Endpoint URLs

After deployment, you'll see function URLs like:
```
https://fra.cloud.appwrite.io/v1/functions/auth0-login
https://fra.cloud.appwrite.io/v1/functions/auth0-signup
https://fra.cloud.appwrite.io/v1/functions/auth0-password-reset
https://fra.cloud.appwrite.io/v1/functions/auth0-profile
```

**Test with curl:**
```bash
export FUNC_URL="https://fra.cloud.appwrite.io/v1/functions"

# Test 1: Get authorization URL
curl -X POST "$FUNC_URL/auth0-login" \
  -H "Content-Type: application/json" \
  -d '{"state": "test-state"}'

# Expected Response:
# {
#   "success": true,
#   "authorizationUrl": "https://...",
#   "state": "test-state"
# }
```

### Test 2: Create User

```bash
# Create a test user
curl -X POST "$FUNC_URL/auth0-signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Expected Response:
# {
#   "success": true,
#   "user": {
#     "userId": "auth0|...",
#     "email": "test@example.com",
#     "emailVerified": false,
#     "createdAt": "2024-01-01T..."
#   },
#   "message": "User created successfully. Please verify your email."
# }
```

### Test 3: Get User Profile

```bash
# Get profile by email
curl -X GET "$FUNC_URL/auth0-profile?email=test@example.com"

# Expected Response:
# {
#   "success": true,
#   "user": {
#     "userId": "auth0|...",
#     "email": "test@example.com",
#     ...
#   }
# }
```

### Test 4: Full OAuth Flow

**Step 1:** Get authorization URL (from Test 1)
```
Open URL in browser → Login with Auth0 credentials
```

**Step 2:** Get authorization code from redirect
```
Browser will redirect to: http://localhost:3000/api/auth/callback?code=...&state=test-state
```

**Step 3:** Exchange code for tokens
```bash
curl -X POST "$FUNC_URL/auth0-login" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "your_auth_code_here",
    "state": "test-state"
  }'

# Expected Response:
# {
#   "success": true,
#   "accessToken": "eyJ0eXAi...",
#   "idToken": "eyJ0eXAi...",
#   "refreshToken": "eyJ0eXAi...",
#   "expiresIn": 86400,
#   "tokenType": "Bearer"
# }
```

## 15-Minute Integration

### Add Auth0 MCP to PrintHub

1. **Copy API Routes**
   ```bash
   # Copy from PRINTHUB_INTEGRATION.md:
   # src/app/api/auth/init.ts
   # src/app/api/auth/callback.ts
   # src/app/api/auth/signup.ts
   # src/app/api/auth/profile.ts
   # src/app/api/auth/reset-password.ts
   ```

2. **Update Auth Context**
   ```bash
   # Copy from PRINTHUB_INTEGRATION.md:
   # Update src/contexts/auth-context.tsx
   ```

3. **Create UI Components**
   ```bash
   # Copy from PRINTHUB_INTEGRATION.md:
   # src/components/auth/LoginButton.tsx
   # src/components/auth/SignupForm.tsx
   ```

4. **Update Environment Variables**
   ```bash
   # Add to .env.local:
   NEXT_PUBLIC_APPWRITE_FUNCTIONS_URL=https://fra.cloud.appwrite.io/v1/functions
   AUTH0_REDIRECT_URI=http://localhost:3000/api/auth/callback
   ```

5. **Test in PrintHub**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Click "Sign In" button
   # Should redirect to Auth0 login
   ```

## Quick Debugging

### Issue: "Config not initialized"
**Solution:** Check environment variables in Appwrite Console function settings

### Issue: "Token exchange failed"
**Solution:** Verify `REDIRECT_URI` matches Auth0 application callback URL

### Issue: "User already exists"
**Solution:** Use unique email for testing: `test+$(date +%s)@example.com`

### Issue: CORS Error
**Solution:** Check if Appwrite function allows origin

## Success Checklist

✅ All 4 functions created in Appwrite
✅ Environment variables set correctly
✅ Login function returns authorization URL
✅ Signup function creates user in Auth0
✅ Profile function retrieves user info
✅ OAuth code exchange works
✅ PrintHub API routes created
✅ Auth context integrated
✅ Login button works
✅ Full login flow complete

## Next Steps

After successful testing:

1. **Set up automatic testing** - Create CI/CD pipeline
2. **Configure email verification** - Auth0 email templates
3. **Add refresh token rotation** - Secure token management
4. **Deploy to production** - Update REDIRECT_URI for prod domain
5. **Monitor and log** - Setup error tracking (Sentry)
6. **Add more auth methods** - Social logins (Google, GitHub)

## Production Checklist

- [ ] Use HTTPS-only in production
- [ ] Set `NODE_ENV=production` in Appwrite
- [ ] Use strong API keys
- [ ] Enable CORS only for your domain
- [ ] Configure Auth0 production settings
- [ ] Set up monitoring and alerts
- [ ] Test on staging environment first
- [ ] Document deployment process
- [ ] Create rollback plan

## File Locations

Key files in this repository:

```
appwrite/auth0/
├── login.js                    # OAuth 2.0 login function
├── signup.js                   # User signup function
├── password-reset.js           # Password reset function
├── profile.js                  # User profile function
├── server.js                   # Core Auth0Server class
├── config.js                   # Configuration manager
├── package.json                # Dependencies
├── README.md                   # Function documentation
├── SERVER_SETUP.md             # Detailed setup guide
├── TESTING.md                  # Complete test cases
├── PRINTHUB_INTEGRATION.md     # PrintHub integration
├── deploy.sh                   # Deployment script
└── QUICKSTART.md               # This file
```

## Support

For issues or questions:
1. Check TESTING.md for test cases
2. Check PRINTHUB_INTEGRATION.md for integration help
3. Review error logs in Appwrite Console
4. Check Auth0 dashboard for user creation logs

## Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Appwrite Functions](https://appwrite.io/docs/products/functions)
- [GitHub Repository](https://github.com/mayankmishra0403/mcp-tools)
- [PrintHub Project](https://github.com/mayankmishra0403/printHub)

---

**Estimated Time:** 15 minutes ✅
**Difficulty:** Beginner-friendly 🎯
**Status:** Ready to deploy 🚀
