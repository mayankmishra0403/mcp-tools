/**
 * Appwrite Function: auth0-profile
 * Platform: Auth0 OAuth 2.0
 * Server: Auth0 MCP Server
 * 
 * Handles user profile operations:
 * 1. Get user profile by ID
 * 2. Update user profile (metadata)
 * 3. Get user by email
 */

import Auth0Server from "./server.js";

const auth0 = new Auth0Server();

export default async ({ req, res, log }) => {
  log(`[auth0-profile] ${req.method} request received`);

  if (!["GET", "PATCH"].includes(req.method)) {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Only GET and PATCH requests are allowed",
    });
  }

  try {
    // Initialize Auth0 server
    if (!auth0.isReady()) {
      log("[auth0-profile] Initializing Auth0 server...");
      await auth0.init();
    }

    // GET: Fetch user profile
    if (req.method === "GET") {
      const { userId, email } = req.query;

      if (!userId && !email) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Either userId or email is required",
        });
      }

      log(`[auth0-profile] Fetching profile for: ${userId || email}...`);

      let user;
      if (userId) {
        user = await auth0.getUser(userId);
      } else {
        // Search by email using Management API
        const config = auth0.getConfig();
        const mgmtToken = await auth0.getManagementToken();

        const response = await fetch(
          `${config.usersEndpoint}?q=email:"${email}"&search_engine=v3`,
          {
            headers: {
              Authorization: `Bearer ${mgmtToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to search users by email");
        }

        const users = await response.json();
        if (!users.length) {
          return res.status(404).json({
            error: "User Not Found",
            message: `No user found with email: ${email}`,
          });
        }

        user = users[0];
      }

      log(`[auth0-profile] ✅ Profile retrieved`);

      return res.json({
        success: true,
        user: {
          userId: user.user_id,
          email: user.email,
          emailVerified: user.email_verified,
          name: user.name,
          picture: user.picture,
          nickname: user.nickname,
          metadata: user.user_metadata || {},
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLogin: user.last_login,
        },
      });
    }

    // PATCH: Update user profile
    if (req.method === "PATCH") {
      const { userId, updates } = req.body;

      if (!userId || !updates) {
        return res.status(400).json({
          error: "Validation Error",
          message: "userId and updates are required",
        });
      }

      log(`[auth0-profile] Updating profile for: ${userId}...`);

      const updatedUser = await auth0.updateUser(userId, updates);

      log(`[auth0-profile] ✅ Profile updated`);

      return res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          userId: updatedUser.user_id,
          email: updatedUser.email,
          emailVerified: updatedUser.email_verified,
          metadata: updatedUser.user_metadata || {},
          updatedAt: updatedUser.updated_at,
        },
      });
    }

  } catch (error) {
    log(`[auth0-profile] ❌ Error: ${error.message}`);

    return res.status(500).json({
      error: "Profile Operation Error",
      message: error.message,
    });
  }
};
