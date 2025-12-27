/**
 * Auth0 MCP Server - Core Authentication Server
 * Handles all Auth0 OAuth 2.0 flows and operations
 */

import Auth0Config from "./config.js";

export class Auth0Server {
  constructor() {
    this.config = new Auth0Config();
    this.isInitialized = false;
  }

  /**
   * Initialize Auth0 server with configuration
   */
  async init(projectName = "printHub") {
    try {
      await this.config.init(projectName);
      this.config.validate();
      this.isInitialized = true;
      return this.config.getAll();
    } catch (error) {
      throw new Error(`Failed to initialize Auth0 server: ${error.message}`);
    }
  }

  /**
   * Generate OAuth Authorization URL
   * Step 1 of OAuth 2.0 flow
   */
  generateAuthorizationUrl(state = "default-state", scope = "openid profile email") {
    if (!this.isInitialized) throw new Error("Server not initialized");

    const url = new URL(this.config.getAuthorizationBaseUrl());
    url.searchParams.append("client_id", this.config.getClientId());
    url.searchParams.append("redirect_uri", this.config.getRedirectUri());
    url.searchParams.append("response_type", "code");
    url.searchParams.append("scope", scope);
    url.searchParams.append("state", state);

    return url.toString();
  }

  /**
   * Exchange Authorization Code for Tokens
   * Step 2 of OAuth 2.0 flow
   */
  async exchangeCodeForToken(code) {
    if (!this.isInitialized) throw new Error("Server not initialized");

    try {
      const response = await fetch(this.config.getTokenEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.config.getClientId(),
          client_secret: this.config.getClientSecret(),
          audience: `https://${this.config.getDomain()}/api/v2/`,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: this.config.getRedirectUri(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token exchange failed: ${error.error_description}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to exchange code: ${error.message}`);
    }
  }

  /**
   * Get User Info using Access Token
   */
  async getUserInfo(accessToken) {
    if (!this.isInitialized) throw new Error("Server not initialized");

    try {
      const response = await fetch(this.config.getUserInfoEndpoint(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch user info: ${error.message}`);
    }
  }

  /**
   * Get Management API Token for admin operations
   */
  async getManagementToken() {
    if (!this.isInitialized) throw new Error("Server not initialized");

    try {
      const response = await fetch(this.config.getTokenEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.config.getClientId(),
          client_secret: this.config.getClientSecret(),
          audience: this.config.getManagementApiEndpoint(),
          grant_type: "client_credentials",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get management token");
      }

      const { access_token } = await response.json();
      return access_token;
    } catch (error) {
      throw new Error(`Failed to get management token: ${error.message}`);
    }
  }

  /**
   * Create new user (Sign Up)
   */
  async createUser(email, password, metadata = {}) {
    if (!this.isInitialized) throw new Error("Server not initialized");

    try {
      const mgmtToken = await this.getManagementToken();

      const response = await fetch(this.config.getUsersEndpoint(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          connection: "Username-Password-Authentication",
          user_metadata: metadata,
          email_verified: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`User creation failed: ${error.message}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    if (!this.isInitialized) throw new Error("Server not initialized");

    try {
      const mgmtToken = await this.getManagementToken();

      const response = await fetch(`${this.config.getUsersEndpoint()}/${userId}`, {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`User not found: ${userId}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    if (!this.isInitialized) throw new Error("Server not initialized");

    try {
      const mgmtToken = await this.getManagementToken();

      const response = await fetch(`${this.config.getUsersEndpoint()}/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`User update failed`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    if (!this.isInitialized) throw new Error("Server not initialized");

    try {
      const mgmtToken = await this.getManagementToken();

      const response = await fetch(`${this.config.getUsersEndpoint()}/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`User deletion failed`);
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, newPassword) {
    if (!this.isInitialized) throw new Error("Server not initialized");

    return this.updateUser(userId, {
      password: newPassword,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email) {
    if (!this.isInitialized) throw new Error("Server not initialized");

    try {
      const mgmtToken = await this.getManagementToken();

      const response = await fetch(
        `${this.config.getManagementApiEndpoint()}jobs/send-verification-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${mgmtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: this.config.getClientId(),
            user_id: email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send reset email`);
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to send password reset: ${error.message}`);
    }
  }

  /**
   * Get configuration
   */
  getConfig() {
    return this.config.getAll();
  }

  /**
   * Check if server is initialized
   */
  isReady() {
    return this.isInitialized;
  }
}

export default Auth0Server;
