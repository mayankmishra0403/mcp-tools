# Appwrite Functions

Serverless functions for Appwrite integration platform.

## Functions

### Auth0 Integration
- **[auth0/login.js](./auth0/login.js)** - OAuth 2.0 authentication handler
- **[auth0/signup.js](./auth0/signup.js)** - User registration and creation
- **[auth0/package.json](./auth0/package.json)** - Dependencies and metadata

See [auth0/README.md](./auth0/README.md) for complete documentation.

## Coming Soon

- **resend/** - Email service integration
- **stripe/** - Payment processing integration
- **auth0/** - Additional Auth0 functions (password reset, email verification, etc.)

## General Setup

All Appwrite functions follow this pattern:

```javascript
export default async ({ req, res, log }) => {
  // req: HTTP request object
  // res: HTTP response builder
  // log: Logging function

  try {
    // Function logic
    return res.json({ success: true, data: ... });
  } catch (error) {
    log(`Error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};
```

## Deployment Methods

### 1. Web Console
1. Go to Appwrite Console
2. Navigate to Functions
3. Create new function
4. Copy-paste code
5. Set environment variables
6. Deploy

### 2. Appwrite CLI
```bash
appwrite functions createDeployment \
  --functionId function-name \
  --entrypoint entry.js \
  --source ./path
```

### 3. GitHub Actions (Recommended for production)
Automate deployments on push to main branch.

## Environment Variables Template

```env
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
REDIRECT_URI=http://localhost:3000/api/auth/callback
NODE_ENV=production
```

## Best Practices

1. **Error Handling** - Always use try-catch and return appropriate status codes
2. **Logging** - Use the provided `log()` function for debugging
3. **Validation** - Validate all input parameters
4. **Security** - Never expose secrets in logs or responses
5. **Documentation** - Include README.md with each function
6. **Dependencies** - Keep package.json minimal and updated

## Resources

- [Appwrite Functions Documentation](https://appwrite.io/docs/products/functions)
- [Auth0 Integration Guide](./auth0/README.md)
- [Node.js Runtime Reference](https://appwrite.io/docs/runtimes/node)

---

**Status:** Auth0 integration ✅ | Resend (🔄 in progress) | Stripe (🔄 in progress)
