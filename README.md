# MCP Tools - Centralized Functions Hub 🚀

**MCP (Model Context Protocol) Tools** is a centralized, production-ready repository for serverless functions and integrations across multiple platforms. Built for scalability, security, and ease of deployment.

## 📋 Repository Structure

```
mcp-tools/
├── appwrite/
│   ├── auth0/                    # ✅ Complete Auth0 MCP Server
│   │   ├── server.js             # Auth0Server class (main logic)
│   │   ├── config.js             # Configuration manager
│   │   ├── login.js              # OAuth 2.0 login handler
│   │   ├── signup.js             # User registration
│   │   ├── password-reset.js     # Password reset flow
│   │   ├── profile.js            # User profile management
│   │   ├── package.json          # Dependencies
│   │   ├── deploy.sh             # Deployment script
│   │   ├── QUICKSTART.md         # 15-minute setup guide ⭐
│   │   ├── SERVER_SETUP.md       # Complete server setup
│   │   ├── TESTING.md            # Test cases & debugging
│   │   ├── PRINTHUB_INTEGRATION.md  # Next.js integration
│   │   └── README.md             # Function documentation
│   ├── resend/                   # Email service functions (🔄 coming soon)
│   ├── stripe/                   # Payment functions (🔄 coming soon)
│   └── README.md
├── supabase/                      # Supabase functions (🔄 coming soon)
├── vercel/                        # Vercel Edge functions (🔄 coming soon)
├── docs/                          # General documentation
└── README.md                      # This file
```

## 🚀 Features

### ✅ Appwrite Functions - Auth0 MCP Server (PRODUCTION READY)

**Complete OAuth 2.0 Authentication Platform**

- ✅ **OAuth 2.0 Login** - Authorization code flow with token exchange
- ✅ **User Signup** - Email/password registration via Management API
- ✅ **Password Reset** - Send password reset emails
- ✅ **User Management** - Get, update, delete user profiles
- ✅ **Admin Operations** - Full Management API access
- ✅ **Token Management** - Access tokens, ID tokens, refresh tokens
- ✅ **Logging & Debugging** - Comprehensive error handling
- ✅ **Security** - Encrypted credentials, CORS support
- ✅ **Testing** - Complete test suite with examples
- ✅ **Documentation** - 5 guides covering all aspects

**Quick Links:**
- ⭐ [15-Minute Quick Start](./appwrite/auth0/QUICKSTART.md) - Deploy in 15 minutes
- 📖 [Server Setup Guide](./appwrite/auth0/SERVER_SETUP.md) - Architecture & detailed setup
- 🧪 [Testing Guide](./appwrite/auth0/TESTING.md) - All test cases & debugging
- 🔗 [PrintHub Integration](./appwrite/auth0/PRINTHUB_INTEGRATION.md) - Next.js integration code
- 📚 [Function Documentation](./appwrite/auth0/README.md) - API reference

### 📋 Planned Integrations

- **Resend Integration** - Email sending service (🔄 in progress)
- **Stripe Integration** - Payment processing (🔄 in progress)

### Platform Support
- ✅ **Appwrite Functions** (Node.js 18.0+) - Production Ready
- 📋 Supabase Edge Functions (planned)
- 📋 Vercel Edge Functions (planned)
- 📋 AWS Lambda (planned)
- 📋 Google Cloud Functions (planned)

## 📦 Installation & Usage

### Appwrite Auth0 MCP Server - Quick Start (⭐ RECOMMENDED)

**Get started in 15 minutes!**

```bash
# 1. Clone the repository
git clone https://github.com/mayankmishra0403/mcp-tools.git
cd mcp-tools/appwrite/auth0

# 2. Follow Quick Start Guide
cat QUICKSTART.md
# Or visit: https://github.com/mayankmishra0403/mcp-tools/blob/main/appwrite/auth0/QUICKSTART.md
```

**What you'll do:**
1. Deploy 4 functions to Appwrite (5 minutes)
2. Test all functions with curl (5 minutes)
3. Integrate with PrintHub frontend (5 minutes)

See [QUICKSTART.md](./appwrite/auth0/QUICKSTART.md) for step-by-step instructions.

### Manual Setup (for experienced users)

#### Prerequisites
- Appwrite project with functions enabled
- Auth0 account with application credentials
- Appwrite database: `mcp_hub` with `auth0_projects` collection

#### Setup Steps

1. **Clone & Navigate**
```bash
git clone https://github.com/mayankmishra0403/mcp-tools.git
cd mcp-tools/appwrite/auth0
```

2. **Configure Appwrite Database**
```bash
# Create database and collection
appwrite databases create --databaseId mcp_hub --name "MCP Hub"
appwrite collections create \
  --databaseId mcp_hub \
  --collectionId auth0_projects \
  --name "Auth0 Projects"

# Add attributes
appwrite attributes stringCreate \
  --databaseId mcp_hub \
  --collectionId auth0_projects \
  --key projectName --required

appwrite attributes stringCreate \
  --databaseId mcp_hub \
  --collectionId auth0_projects \
  --key domain --required

appwrite attributes stringCreate \
  --databaseId mcp_hub \
  --collectionId auth0_projects \
  --key clientId --required

appwrite attributes stringCreate \
  --databaseId mcp_hub \
  --collectionId auth0_projects \
  --key clientSecret --required --encrypted

appwrite attributes stringCreate \
  --databaseId mcp_hub \
  --collectionId auth0_projects \
  --key managementApiEndpoint --required

# Create document with your Auth0 config
appwrite documents create \
  --databaseId mcp_hub \
  --collectionId auth0_projects \
  --documentId printHub \
  --data '{
    "projectName": "printHub",
    "domain": "your-domain.auth0.com",
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "managementApiEndpoint": "https://your-domain.auth0.com/api/v2/"
  }'
```

3. **Deploy Functions**

Go to Appwrite Console → Functions → Create Function

For each function (auth0-login, auth0-signup, auth0-password-reset, auth0-profile):
- Copy code from corresponding .js file
- Set runtime to Node.js 18.0
- Set environment variables (see QUICKSTART.md)
- Deploy

4. **Test Functions**

```bash
# Test login
curl -X POST https://your-appwrite.com/functions/auth0-login \
  -H "Content-Type: application/json" \
  -d '{"state": "test"}'

# Test signup
curl -X POST https://your-appwrite.com/functions/auth0-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

5. **Integrate with Frontend**

See [PRINTHUB_INTEGRATION.md](./appwrite/auth0/PRINTHUB_INTEGRATION.md) for complete Next.js integration guide including:
- API routes setup
- Auth context implementation
- UI components (Login, Signup)
- Security best practices

## 📚 Documentation

Complete documentation for each component:

### Auth0 MCP Server (Appwrite)
- **[QUICKSTART.md](./appwrite/auth0/QUICKSTART.md)** ⭐ - 15-minute deployment & testing guide
- **[SERVER_SETUP.md](./appwrite/auth0/SERVER_SETUP.md)** - Architecture, all functions, environment setup
- **[TESTING.md](./appwrite/auth0/TESTING.md)** - Test cases, error testing, load testing
- **[PRINTHUB_INTEGRATION.md](./appwrite/auth0/PRINTHUB_INTEGRATION.md)** - Next.js integration code
- **[README.md](./appwrite/auth0/README.md)** - API reference and function documentation
- **[deploy.sh](./appwrite/auth0/deploy.sh)** - Deployment script

### General
- **[README.md](./README.md)** - This file
- **[appwrite/README.md](./appwrite/README.md)** - Appwrite functions overview

## 🛠️ Development

### Adding New Functions

1. Create new folder under platform:
```bash
mkdir -p appwrite/service_name
```

2. Create function files:
```bash
touch appwrite/service_name/{function_name}.js
touch appwrite/service_name/package.json
touch appwrite/service_name/README.md
```

3. Follow the structure and pattern from auth0 functions

4. Update README with new section

5. Commit and push:
```bash
git add .
git commit -m "feat: Add service_name integration"
git push origin main
```

## 🔐 Security

- **Never commit secrets** - Use Appwrite encrypted attributes
- **Environment variables** - All sensitive data in env vars
- **HTTPS only** - Production URLs must use HTTPS
- **Input validation** - Always validate user input
- **Rate limiting** - Implement on public endpoints
- **Token storage** - Use httpOnly cookies for tokens
- **CORS configuration** - Whitelist specific origins
- **Error handling** - Don't expose sensitive errors

## 📊 Project Status

| Component | Status | Production | Testing | Integration |
|-----------|--------|-----------|---------|-------------|
| **Auth0 Login** | ✅ Complete | Ready | Complete | Complete |
| **Auth0 Signup** | ✅ Complete | Ready | Complete | Complete |
| **Auth0 Password Reset** | ✅ Complete | Ready | Complete | Complete |
| **Auth0 Profile** | ✅ Complete | Ready | Complete | Complete |
| **Resend Email** | 🔄 Planned | - | - | - |
| **Stripe Payment** | 🔄 Planned | - | - | - |
| **Supabase Functions** | 🔄 Planned | - | - | - |
| **Vercel Edge** | 🔄 Planned | - | - | - |

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/function-name`
3. Follow the structure of existing functions
4. Add comprehensive documentation
5. Test thoroughly
6. Commit: `git commit -m "feat: Add function description"`
7. Push: `git push origin feature/function-name`
8. Open Pull Request

## 📖 API Reference

### Auth0 Login
```
POST /functions/auth0-login
Body: { "code"?: string, "state": string }
Response: { "success": boolean, "authorizationUrl"?: string, "accessToken"?: string, ... }
```

### Auth0 Signup
```
POST /functions/auth0-signup
Body: { "email": string, "password": string, "firstName"?: string, "lastName"?: string, "metadata"?: object }
Response: { "success": boolean, "user": object, "message": string }
```

### Auth0 Password Reset
```
POST /functions/auth0-password-reset
Body: { "email": string }
Response: { "success": boolean, "message": string, "email": string }
```

### Auth0 Profile
```
GET /functions/auth0-profile?userId=... OR email=...
Response: { "success": boolean, "user": object }

PATCH /functions/auth0-profile
Body: { "userId": string, "updates": object }
Response: { "success": boolean, "message": string, "user": object }
```

## 🔗 Related Projects

- **[PrintHub](https://github.com/mayankmishra0403/printHub)** - Next.js application using Auth0 MCP Server
- **[Appwrite](https://appwrite.io)** - Serverless platform hosting these functions
- **[Auth0](https://auth0.com)** - OAuth 2.0 provider
- **[Supabase](https://supabase.com)** - PostgreSQL database for PrintHub

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

**Mayank Mishra**
- GitHub: [@mayankmishra0403](https://github.com/mayankmishra0403)
- Email: mayankmishra7296@gmail.com
- Domain: ritambharat.software

## 🚀 Getting Help

1. **Quick Start Issues** - See [QUICKSTART.md](./appwrite/auth0/QUICKSTART.md#quick-debugging)
2. **Testing Issues** - See [TESTING.md](./appwrite/auth0/TESTING.md#troubleshooting)
3. **Integration Issues** - See [PRINTHUB_INTEGRATION.md](./appwrite/auth0/PRINTHUB_INTEGRATION.md#troubleshooting)
4. **General Help** - Open an issue on GitHub

## 📚 Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Appwrite Functions](https://appwrite.io/docs/products/functions)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [Next.js Documentation](https://nextjs.org/docs)
- [Node.js Runtime](https://nodejs.org/docs)

---

**Status:** Production Ready ✅
**Last Updated:** December 27, 2024
**Version:** 2.0.0
