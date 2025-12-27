import { Client, Databases } from "node-appwrite";

/**
 * Appwrite Function: auth0-login
 * Platform: Auth0 OAuth 2.0
 * 
 * This function handles Auth0 login flow:
 * 1. Retrieves Auth0 configuration from Appwrite Database
 * 2. Constructs Auth0 authorization URL
 * 3. Redirects user to Auth0 login page
 * 4. Handles callback and token exchange
 * 5. Returns JWT token to frontend
 */

export default async ({ req, res, log }) => {
  // Log incoming request
  log(`[auth0-login] Request method: ${req.method}`);

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Only POST requests are allowed",
    });
  }

  try {
    const { code, state } = req.body;

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Retrieve Auth0 configuration from database
    log("[auth0-login] Fetching Auth0 config from database...");

    const config = await databases.getDocument(
      "mcp_hub", // database ID
      "auth0_projects", // collection ID
      "printHub" // document ID (project name)
    );

    log("[auth0-login] Auth0 config retrieved successfully");

    const { domain, clientId, clientSecret, managementApiEndpoint } = config;

    // If code is provided, exchange it for token (callback flow)
    if (code) {
      log("[auth0-login] Exchanging code for token...");

      const tokenResponse = await fetch(`https://${domain}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          audience: `https://${domain}/api/v2/`,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: `${process.env.REDIRECT_URI || "http://localhost:3000/api/auth/callback"}`,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        log(`[auth0-login] Token exchange failed: ${error.error}`);
        return res.status(400).json({
          error: "Token Exchange Failed",
          details: error.error_description,
        });
      }

      const tokens = await tokenResponse.json();

      log("[auth0-login] Token exchange successful");

      return res.json({
        success: true,
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        expiresIn: tokens.expires_in,
      });
    }

    // If no code, return authorization URL (initial flow)
    log("[auth0-login] Generating authorization URL...");

    const authorizationUrl = new URL(`https://${domain}/authorize`);
    authorizationUrl.searchParams.append("client_id", clientId);
    authorizationUrl.searchParams.append("redirect_uri", process.env.REDIRECT_URI || "http://localhost:3000/api/auth/callback");
    authorizationUrl.searchParams.append("response_type", "code");
    authorizationUrl.searchParams.append("scope", "openid profile email");
    authorizationUrl.searchParams.append("state", state || "default-state");

    log("[auth0-login] Authorization URL generated");

    return res.json({
      success: true,
      authorizationUrl: authorizationUrl.toString(),
    });

  } catch (error) {
    log(`[auth0-login] Error: ${error.message}`);

    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
