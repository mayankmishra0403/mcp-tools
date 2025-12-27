/**
 * Appwrite Function: auth0-password-reset
 * Platform: Auth0 OAuth 2.0
 * Server: Auth0 MCP Server
 * 
 * Handles password reset flow:
 * 1. Validates email
 * 2. Sends password reset email via Auth0
 * 3. Returns confirmation message
 */

import Auth0Server from "./server.js";

const auth0 = new Auth0Server();

export default async ({ req, res, log }) => {
  log(`[auth0-password-reset] ${req.method} request received`);

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Only POST requests are allowed",
    });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Email is required",
      });
    }

    // Initialize Auth0 server
    if (!auth0.isReady()) {
      log("[auth0-password-reset] Initializing Auth0 server...");
      await auth0.init();
    }

    log(`[auth0-password-reset] Sending password reset email to ${email}...`);

    const config = auth0.getConfig();
    const mgmtToken = await auth0.getManagementToken();

    const response = await fetch(
      `${config.managementApiEndpoint}tickets/password-change`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: config.clientId,
          email: email,
          connection_id: "con_6Z7wH5pJ9K4L2M0Q",
          ttl_sec: 86400, // 24 hours
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      log(`[auth0-password-reset] ❌ Failed: ${error.message}`);
      return res.status(400).json({
        error: "Password Reset Failed",
        message: error.message,
      });
    }

    log(`[auth0-password-reset] ✅ Password reset email sent`);

    return res.json({
      success: true,
      message: "Password reset email sent. Please check your inbox.",
      email: email,
    });

  } catch (error) {
    log(`[auth0-password-reset] ❌ Error: ${error.message}`);

    return res.status(500).json({
      error: "Password Reset Error",
      message: error.message,
    });
  }
};
