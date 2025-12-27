# MCP Tools - Centralized Functions Hub

**MCP (Model Context Protocol) Tools** is a centralized repository for serverless functions and integrations across multiple platforms.

## 📋 Repository Structure

```
mcp-tools/
├── appwrite/
│   ├── auth0/
│   │   ├── login.js              # OAuth 2.0 login handler
│   │   ├── signup.js             # User registration via Management API
│   │   ├── package.json          # Dependencies
│   │   └── README.md             # Documentation
│   ├── resend/                   # Email service functions (coming soon)
│   ├── stripe/                   # Payment functions (coming soon)
│   └── README.md
├── supabase/                      # Supabase functions (coming soon)
├── vercel/                        # Vercel Edge functions (coming soon)
├── docs/                          # General documentation
└── README.md                      # This file
```

## 🚀 Features

### Appwrite Functions
- **Auth0 Integration** - Complete OAuth 2.0 flow with Management API
  - Login with authorization code flow
  - User signup with email/password
  - Coming: Email verification, password reset, user profile management
- **Resend Integration** - Email sending service (planned)
- **Stripe Integration** - Payment processing (planned)

### Platform Support
- ✅ Appwrite Functions (Node.js 18.0+)
- 📋 Supabase Edge Functions (planned)
- 📋 Vercel Edge Functions (planned)
- 📋 AWS Lambda (planned)
- 📋 Google Cloud Functions (planned)

## 📦 Installation & Usage

### Appwrite Auth0 Functions

#### Prerequisites
- Appwrite project with CLI configured
- Auth0 account with application credentials
- Appwrite database: `mcp_hub` with Auth0 config

#### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/mayankmishra0403/mcp-tools.git
cd mcp-tools/appwrite/auth0
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Appwrite Database**

Create `mcp_hub` database with `auth0_projects` collection:

```bash
# Using Appwrite CLI
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
  --documentId your_project_name \
  --data '{"projectName":"...","domain":"...","clientId":"...","clientSecret":"...","managementApiEndpoint":"..."}'
```

4. **Deploy Functions**

```bash
# Deploy all Auth0 functions
npm run deploy:all

# Or individual functions
npm run deploy:login
npm run deploy:signup
```

5. **Use in Your Application**

```typescript
// Call from your frontend
const response = await fetch('/api/functions/auth0-login', {
  method: 'POST',
  body: JSON.stringify({
    code: authCode, // Optional: if exchanging code for token
    state: 'your-state'
  })
});

const { authorizationUrl, accessToken } = await response.json();
```

## 📚 Documentation

Each platform has its own documentation:

- [Appwrite Auth0 Functions](./appwrite/auth0/README.md)
- More coming soon...

## 🛠️ Development

### Adding New Functions

1. Create new folder under appropriate platform:
```bash
mkdir -p appwrite/service_name
```

2. Create function files:
```bash
touch appwrite/service_name/{function_name}.js
touch appwrite/service_name/package.json
touch appwrite/service_name/README.md
```

3. Follow the structure and documentation pattern from existing functions

4. Update this README with new section

5. Commit and push:
```bash
git add .
git commit -m "feat: Add service_name integration"
git push origin main
```

## 🔐 Security

- Never commit API keys or secrets
- Use Appwrite encrypted attributes for sensitive data
- Environment variables for configuration
- Always validate and sanitize user input
- Implement rate limiting on public endpoints

## 📊 Project Status

| Platform | Auth | Email | Payment | Status |
|----------|------|-------|---------|--------|
| **Appwrite** | ✅ Auth0 | 🔄 Resend | 🔄 Stripe | Active |
| **Supabase** | 🔄 Planned | - | - | Planned |
| **Vercel** | 🔄 Planned | - | - | Planned |

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/function-name`
3. Commit changes: `git commit -m "feat: Add function description"`
4. Push branch: `git push origin feature/function-name`
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

**Mayank Mishra**
- GitHub: [@mayankmishra0403](https://github.com/mayankmishra0403)
- Email: mayankmishra7296@gmail.com

## 🔗 Related Projects

- **PrintHub** - Next.js application using these functions
- **Appwrite Hub** - Centralized configuration management
- **MCP Ecosystem** - Multi-platform function framework

---

**Last Updated:** December 2024
