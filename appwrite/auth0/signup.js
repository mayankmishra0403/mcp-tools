import { Client, Databases } from "node-appwrite";

/**
 * Appwrite Function: auth0-signup
 * Platform: Auth0 OAuth 2.0 + Management API
 * 
 * This function handles Auth0 user signup:
 * 1. Retrieves Auth0 configuration from Appwrite Database
 * 2. Creates user in Auth0 using Management API
 * 3. Optionally triggers Auth0 rules/actions
 * 4. Returns JWT token for auto-login
 */

export default async ({ req, res, log }) => {
  log(`[auth0-signup] Request method: ${req.method}`);

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

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Retrieve Auth0 configuration
    log("[auth0-signup] Fetching Auth0 config...");

    const config = await databases.getDocument(
      "mcp_hub",
      "auth0_projects",
      "printHub"
    );

    const { domain, managementApiEndpoint, clientId, clientSecret } = config;

    // Get Management API token
    log("[auth0-signup] Getting Management API token...");

    const mgmtTokenResponse = await fetch(
      `https://${domain}/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          audience: `${managementApiEndpoint}`,
          grant_type: "client_credentials",
        }),
      }
    );

    if (!mgmtTokenResponse.ok) {
      const error = await mgmtTokenResponse.json();
      log(`[auth0-signup] Failed to get Management API token: ${error.error}`);
      return res.status(500).json({
        error: "Auth0 API Error",
        message: "Failed to authenticate with Auth0 Management API",
      });
    }

    const { access_token: mgmtToken } = await mgmtTokenResponse.json();

    // Create user in Auth0
    log("[auth0-signup] Creating user in Auth0...");

    const createUserResponse = await fetch(
      `${managementApiEndpoint}users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          connection: "Username-Password-Authentication",
          user_metadata: {
            firstName: firstName || "",
            lastName: lastName || "",
            ...metadata,
          },
          email_verified: false,
        }),
      }
    );

    if (!createUserResponse.ok) {
      const error = await createUserResponse.json();
      log(`[auth0-signup] User creation failed: ${error.statusCode}`);
      return res.status(400).json({
        error: error.error || "User Creation Failed",
        message: error.error_description || error.message,
      });
    }

    const newUser = await createUserResponse.json();
    log(`[auth0-signup] User created: ${newUser.user_id}`);

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
    log(`[auth0-signup] Error: ${error.message}`);

    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
