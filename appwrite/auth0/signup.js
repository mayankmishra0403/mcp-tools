/**
 * Appwrite Function: auth0-signup
 * Platform: Auth0 OAuth 2.0 + Management API
 * Server: Auth0 MCP Server
 * 
 * Handles Auth0 user signup:
 * 1. Validates email and password
 * 2. Creates user using Auth0 Management API
 * 3. Returns user ID and metadata
 */

import Auth0Server from "./server.js";

const auth0 = new Auth0Server();

export default async ({ req, res, log }) => {
  log(`[auth0-signup] ${req.method} request received`);

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Only POST requests are allowed",
    });
  }

  try {
    const { email, password, firstName, lastName, metadata } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Email and password are required",
      });
    }

    // Initialize Auth0 server
    if (!auth0.isReady()) {
      log("[auth0-signup] Initializing Auth0 server...");
      await auth0.init();
    }

    log("[auth0-signup] Creating user in Auth0...");

    const newUser = await auth0.createUser(email, password, {
      firstName: firstName || "",
      lastName: lastName || "",
      ...metadata,
    });

    log(`[auth0-signup] ✅ User created: ${newUser.user_id}`);

    return res.status(201).json({
      success: true,
      user: {
        userId: newUser.user_id,
        email: newUser.email,
        emailVerified: newUser.email_verified,
        createdAt: newUser.created_at,
      },
      message: "User created successfully. Please verify your email.",
    });

  } catch (error) {
    log(`[auth0-signup] ❌ Error: ${error.message}`);

    return res.status(500).json({
      error: "Signup Error",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
