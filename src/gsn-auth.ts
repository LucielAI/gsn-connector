/**
 * GSN Auth Module
 * Handles authentication and authorization for agent communication
 */

import { v4 as uuidv4 } from 'uuid';
import { createHash, createSign, createVerify } from 'crypto';
import { AuthToken, AuthOptions, AgentIdentity, SharedVault } from '../types';

export interface AuthConfig {
  secretKey?: string;
  tokenExpiry?: number; // in seconds
  allowedAgents?: string[];
}

export class GSNAuth {
  private agentIdentity: AgentIdentity;
  private secretKey: string;
  private tokenExpiry: number;
  private allowedAgents: string[];
  private issuedTokens: Map<string, AuthToken> = new Map();
  private revokedTokens: Set<string> = new Set();

  constructor(agentIdentity: AgentIdentity, options: AuthOptions = {}) {
    this.agentIdentity = agentIdentity;
    this.secretKey = options.secretKey || uuidv4();
    this.tokenExpiry = options.tokenExpiry || 3600; // 1 hour default
    this.allowedAgents = options.allowedAgents || [];
  }

  /**
   * Get current agent identity
   */
  public getIdentity(): AgentIdentity {
    return this.agentIdentity;
  }

  /**
   * Generate a new auth token
   */
  public generateToken(scope: 'read' | 'write' | 'admin' = 'read'): AuthToken {
    const tokenData = {
      agentId: this.agentIdentity.id,
      scope,
      issuedAt: Date.now(),
      expiresAt: Date.now() + this.tokenExpiry * 1000,
    };

    const payload = JSON.stringify(tokenData);
    const signature = this.signPayload(payload);

    const token: AuthToken = {
      token: `${payload}.${signature}`,
      agentId: this.agentIdentity.id,
      issuedAt: tokenData.issuedAt,
      expiresAt: tokenData.expiresAt,
      scope,
    };

    this.issuedTokens.set(token.token, token);
    return token;
  }

  /**
   * Validate a token
   */
  public validateToken(tokenString: string): AuthToken | null {
    // Check if token is revoked
    if (this.revokedTokens.has(tokenString)) {
      return null;
    }

    // Check if token is in issued tokens (or can be verified)
    const existingToken = this.issuedTokens.get(tokenString);
    if (existingToken) {
      if (this.isTokenExpired(existingToken)) {
        return null;
      }
      return existingToken;
    }

    // Try to verify standalone token
    const parts = tokenString.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [payload, signature] = parts;

    try {
      const verified = this.verifyPayload(payload, signature);
      if (!verified) {
        return null;
      }

      const tokenData = JSON.parse(payload);
      if (this.isTokenExpired(tokenData)) {
        return null;
      }

      return {
        token: tokenString,
        agentId: tokenData.agentId,
        issuedAt: tokenData.issuedAt,
        expiresAt: tokenData.expiresAt,
        scope: tokenData.scope,
      };
    } catch {
      return null;
    }
  }

  /**
   * Revoke a token
   */
  public revokeToken(tokenString: string): boolean {
    this.issuedTokens.delete(tokenString);
    this.revokedTokens.add(tokenString);
    return true;
  }

  /**
   * Check if agent is allowed
   */
  public isAgentAllowed(agentId: string): boolean {
    if (this.allowedAgents.length === 0) {
      return true; // No restrictions
    }
    return this.allowedAgents.includes(agentId) || this.allowedAgents.includes('*');
  }

  /**
   * Get current agent's token
   */
  public getCurrentToken(scope: 'read' | 'write' | 'admin' = 'read'): AuthToken {
    return this.generateToken(scope);
  }

  /**
   * Verify a token signature
   */
  public verifySignature(tokenString: string): boolean {
    const parts = tokenString.split('.');
    if (parts.length !== 2) {
      return false;
    }

    const [payload, signature] = parts;
    return this.verifyPayload(payload, signature);
  }

  /**
   * Get shared vault state (auth state)
   */
  public getSharedVault(): SharedVault {
    return {
      contextSnippets: new Map(),
      tasks: new Map(),
      insights: new Map(),
      agents: new Map([[this.agentIdentity.id, this.agentIdentity]]),
    };
  }

  /**
   * Sign payload with secret key
   */
  private signPayload(payload: string): string {
    const signer = createSign('RSA-SHA256');
    signer.update(payload);
    return signer.sign(this.secretKey, 'base64');
  }

  /**
   * Verify payload signature
   */
  private verifyPayload(payload: string, signature: string): boolean {
    try {
      const verifier = createVerify('RSA-SHA256');
      verifier.update(payload);
      return verifier.verify(this.secretKey, signature, 'base64');
    } catch {
      return false;
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: { issuedAt: number; expiresAt: number }): boolean {
    const now = Date.now();
    return now < token.issuedAt || now > token.expiresAt;
  }

  /**
   * Clean up expired tokens
   */
  public cleanupExpiredTokens(): void {
    const now = Date.now();
    this.issuedTokens.forEach((token, key) => {
      if (now > token.expiresAt) {
        this.issuedTokens.delete(key);
      }
    });
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.issuedTokens.clear();
    this.revokedTokens.clear();
  }
}
