#!/bin/bash

# Auth0 MCP Server Deployment Script
# Deploys all functions to Appwrite and configures environment

set -e

echo "🚀 Auth0 MCP Server Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APPWRITE_ENDPOINT="${APPWRITE_ENDPOINT:-https://fra.cloud.appwrite.io/v1}"
APPWRITE_PROJECT_ID="${APPWRITE_PROJECT_ID:-694ffb380028abb32fd2}"
APPWRITE_API_KEY="${APPWRITE_API_KEY:-}"
REDIRECT_URI="${REDIRECT_URI:-http://localhost:3000/api/auth/callback}"
NODE_ENV="${NODE_ENV:-production}"

# Functions to deploy
FUNCTIONS=(
  "auth0-login:login.js"
  "auth0-signup:signup.js"
  "auth0-password-reset:password-reset.js"
  "auth0-profile:profile.js"
)

# Check if API key is provided
if [ -z "$APPWRITE_API_KEY" ]; then
  echo -e "${RED}❌ Error: APPWRITE_API_KEY environment variable not set${NC}"
  echo -e "${YELLOW}Please set: export APPWRITE_API_KEY=your_api_key${NC}"
  exit 1
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Endpoint: $APPWRITE_ENDPOINT"
echo "  Project ID: $APPWRITE_PROJECT_ID"
echo "  Redirect URI: $REDIRECT_URI"
echo "  Environment: $NODE_ENV"
echo ""

# Function to create/update Appwrite function
deploy_function() {
  local func_id=$1
  local entry_point=$2
  
  echo -e "${BLUE}📦 Deploying function: $func_id${NC}"
  
  # Note: This script provides the structure
  # Actual deployment should be done via:
  # 1. Appwrite Console (easiest)
  # 2. Appwrite CLI
  # 3. Custom REST API calls
  
  echo -e "${YELLOW}⚠️  Manual Step Required:${NC}"
  echo "  1. Go to Appwrite Console"
  echo "  2. Navigate to Functions"
  echo "  3. Create/Update function: $func_id"
  echo "  4. Set Runtime: Node.js 18.0"
  echo "  5. Set Entry Point: $entry_point"
  echo "  6. Copy code from: $entry_point"
  echo "  7. Deploy"
  echo ""
}

# Deploy all functions
echo -e "${BLUE}🔧 Preparing functions for deployment...${NC}"
echo ""

for func_pair in "${FUNCTIONS[@]}"; do
  IFS=':' read -r func_id entry_point <<< "$func_pair"
  deploy_function "$func_id" "$entry_point"
done

# Environment variables setup
echo -e "${BLUE}🔑 Environment Variables to Set in Appwrite Console:${NC}"
echo ""
cat << 'ENV'
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=694ffb380028abb32fd2
APPWRITE_API_KEY=[YOUR_API_KEY]
REDIRECT_URI=http://localhost:3000/api/auth/callback
NODE_ENV=production
ENV
echo ""

# Verification steps
echo -e "${BLUE}✅ Verification Steps:${NC}"
echo ""
echo "1. Test auth0-login function:"
echo "   curl -X POST https://your-appwrite-domain/functions/auth0-login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"state\": \"test-state\"}'"
echo ""
echo "2. Test auth0-signup function:"
echo "   curl -X POST https://your-appwrite-domain/functions/auth0-signup \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\": \"test@example.com\", \"password\": \"Test123!\"}'"
echo ""
echo "3. Test auth0-profile function:"
echo "   curl -X GET 'https://your-appwrite-domain/functions/auth0-profile?userId=auth0|...'"
echo ""

echo -e "${GREEN}✨ Deployment preparation complete!${NC}"
echo ""
echo "📖 Next Steps:"
echo "  1. Follow the manual steps above in Appwrite Console"
echo "  2. Set environment variables for each function"
echo "  3. Deploy functions"
echo "  4. Test with verification commands above"
echo "  5. Integrate with PrintHub frontend"
echo ""
