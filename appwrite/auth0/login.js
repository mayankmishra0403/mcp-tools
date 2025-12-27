/**
 * Appwrite Function: auth0-login
 * Platform: Auth0 OAuth 2.0
 * Server: Auth0 MCP Server
 * 
 * Handles complete OAuth 2.0 login flow:
 * 1. Generates authorization URL
 * 2. Exchanges authorization code for tokens
 * 3. Returns JWT tokens to frontend
 */

import Auth0Server from "./server.js";

const auth0 = new Auth0Server();

export default async ({ req, res, log }) => {
  log(`[auth0-login] ${req.method} request received`);

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Only POST requests are allowed",
    });
  }

  try {
    // Initialize Auth0 server
    if (!auth0.isReady()) {
      log("[auth0-login] Initializing Auth0 server...");
      await auth0.init();
    }

    const { code, state } = req.body;

    // If code is provided, exchange for token (callback flow)
    if (code) {
      log("[auth0-login] Exchanging authorization code for tokens...");

      const tokens = await auth0.exchangeCodeForToken(code);

      log("[auth0-login] ✅ Token exchange successful");

      return res.json({
        success: true,
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        refreshToken: tokens.refresh_token || null,
        expiresIn: tokens.expires_in,
        tokenType: tokens.token_type,
      });
    }

    // No code = generate authorization URL (initial flow)
    log("[auth0-login] Generating authorization URL...");

    const authorizationUrl = auth0.generateAuthorizationUrl(
      state || "default-state",
      "openid profile email"
    );

    log("[auth0-login] ✅ Authorization URL generated");

    return res.json({
      success: true,
      authorizationUrl: authorizationUrl,
      state: state || "default-state",
    });

  } catch (error) {
    log(`[auth0-login] ❌ Error: ${error.message}`);

    return res.status(500).json({
      error: "Authentication Error",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
