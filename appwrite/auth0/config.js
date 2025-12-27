/**
 * Auth0 MCP Server Configuration
 * Centralized configuration management for Auth0 functions
 */

import { Client, Databases } from "node-appwrite";

export class Auth0Config {
  constructor() {
    this.client = null;
    this.databases = null;
    this.config = null;
  }

  /**
   * Initialize Auth0 configuration
   * Fetches config from Appwrite database
   */
  async init(projectName = "printHub") {
    try {
      this.client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

      this.databases = new Databases(this.client);

      // Fetch Auth0 configuration from database
      this.config = await this.databases.getDocument(
        "mcp_hub",
        "auth0_projects",
        projectName
      );

      return this.config;
    } catch (error) {
      throw new Error(`Failed to initialize Auth0 config: ${error.message}`);
    }
  }

  /**
   * Get Auth0 domain
   */
  getDomain() {
    if (!this.config) throw new Error("Config not initialized");
    return this.config.domain;
  }

  /**
   * Get Auth0 Client ID
   */
  getClientId() {
    if (!this.config) throw new Error("Config not initialized");
    return this.config.clientId;
  }

  /**
   * Get Auth0 Client Secret
   */
  getClientSecret() {
    if (!this.config) throw new Error("Config not initialized");
    return this.config.clientSecret;
  }

  /**
   * Get Auth0 Management API endpoint
   */
  getManagementApiEndpoint() {
    if (!this.config) throw new Error("Config not initialized");
    return this.config.managementApiEndpoint;
  }

  /**
   * Get Redirect URI for OAuth callbacks
   */
  getRedirectUri() {
    return process.env.REDIRECT_URI || "http://localhost:3000/api/auth/callback";
  }

  /**
   * Get full Authorization URL base
   */
  getAuthorizationBaseUrl() {
    return `https://${this.getDomain()}/authorize`;
  }

  /**
   * Get full Token endpoint
   */
  getTokenEndpoint() {
    return `https://${this.getDomain()}/oauth/token`;
  }

  /**
   * Get full User Info endpoint
   */
  getUserInfoEndpoint() {
    return `https://${this.getDomain()}/userinfo`;
  }

  /**
   * Get full Management API Users endpoint
   */
  getUsersEndpoint() {
    return `${this.getManagementApiEndpoint()}users`;
  }

  /**
   * Validate configuration
   */
  validate() {
    const required = [
      "domain",
      "clientId",
      "clientSecret",
      "managementApiEndpoint"
    ];

    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Missing required configuration: ${field}`);
      }
    }

    return true;
  }

  /**
   * Get configuration as object
   */
  getAll() {
    return {
      domain: this.getDomain(),
      clientId: this.getClientId(),
      clientSecret: this.getClientSecret(),
      managementApiEndpoint: this.getManagementApiEndpoint(),
      redirectUri: this.getRedirectUri(),
      authorizationUrl: this.getAuthorizationBaseUrl(),
      tokenEndpoint: this.getTokenEndpoint(),
      userInfoEndpoint: this.getUserInfoEndpoint(),
      usersEndpoint: this.getUsersEndpoint(),
    };
  }
}

export default Auth0Config;
