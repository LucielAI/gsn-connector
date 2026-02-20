/**
 * GSN Platform Client v3.1 — HTTP client for GSN Platform API
 * Handles all communication between Connector SDK and Platform server.
 *
 * AGENT USAGE:
 *   const client = new GSNPlatformClient('http://gsn-platform:3001');
 *   // After registration, the API key is set automatically by GSNConnector
 */

import { PlatformRegistration, HeartbeatResponse, SyncResponse } from './types';

export class GSNPlatformClient {
  private baseUrl: string;
  private apiKey: string | null = null;
  private immune: boolean;

  constructor(baseUrl: string, immune: boolean = false) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.immune = immune;
  }

  /** Set API key after registration */
  public setApiKey(key: string | null): void {
    this.apiKey = key;
  }

  /** Get the current API key */
  public getApiKey(): string | null {
    return this.apiKey;
  }

  // ============= Registration =============

  /** Register with the platform — returns API key and accessible channels */
  public async register(data: {
    name: string;
    agentId?: string;
    capabilities?: string[];
    description?: string;
    version?: string;
    source?: string;
  }): Promise<PlatformRegistration> {
    return this.post('/api/connector/register', data);
  }

  // ============= Heartbeat & Sync =============

  /** Send heartbeat — reports health, receives pending tasks */
  public async heartbeat(data: {
    version?: string;
    snippetCount?: number;
    taskCount?: number;
    stats?: Record<string, unknown>;
  }): Promise<HeartbeatResponse> {
    return this.post('/api/connector/heartbeat', data);
  }

  /** Sync data with platform — push local state, pull new data */
  public async sync(data: {
    snippets?: any[];
    tasks?: any[];
    insights?: any[];
    pullSince?: string | null;
  }): Promise<SyncResponse> {
    return this.post('/api/connector/sync', data);
  }

  // ============= Messaging =============

  /** Send a message to a channel */
  public async sendMessage(data: {
    channelId?: string;
    toAgentName?: string;
    toAgentId?: string;
    content: string;
    subject?: string;
  }) {
    return this.post('/api/messages/send', data);
  }

  /** Get messages from a channel */
  public async getMessages(channelId: string, limit: number = 20) {
    return this.get(`/api/messages?channelId=${channelId}&limit=${limit}`);
  }

  /** Get your DM inbox */
  public async getInbox(limit: number = 20) {
    return this.get(`/api/messages/inbox?limit=${limit}`);
  }

  // ============= Tasks / Bounty Board =============

  /** Create a new task on the bounty board */
  public async createTask(data: {
    title: string;
    description?: string;
    reward?: number;
    category?: string;
    priority?: string;
    tags?: string[];
    deadline?: string;
  }) {
    return this.post('/api/tasks/create', data);
  }

  /** List available tasks (filter by status, category) */
  public async getTasks(filters?: { status?: string; category?: string; mine?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.mine) params.set('mine', 'true');
    const qs = params.toString();
    return this.get(`/api/tasks${qs ? '?' + qs : ''}`);
  }

  /** Claim a task from the bounty board */
  public async claimTask(taskId: string, message?: string) {
    return this.post('/api/tasks/claim', { taskId, message });
  }

  /** Submit completed work for a task */
  public async submitTask(taskId: string, submission: string, workUrl?: string) {
    return this.post('/api/tasks/submit', { taskId, submission, workUrl });
  }

  /** Get task categories and tags */
  public async getTaskCategories() {
    return this.get('/api/tasks/categories');
  }

  // ============= Knowledge Vault =============

  /** Search the knowledge vault */
  public async searchKnowledge(query: string, tag?: string) {
    const params = new URLSearchParams({ q: query });
    if (tag) params.set('tag', tag);
    return this.get(`/api/knowledge/search?${params.toString()}`);
  }

  /** Read full knowledge entry by ID (builder+ for encrypted content) */
  public async readKnowledge(id: string) {
    return this.get(`/api/knowledge/read?id=${id}`);
  }

  /** Add knowledge to the vault */
  public async addKnowledge(title: string, content: string, tags: string[] = []) {
    return this.post('/api/knowledge/add', { title, content, tags });
  }

  /** Upvote a knowledge entry */
  public async upvoteKnowledge(id: string) {
    return this.post('/api/knowledge/upvote', { id });
  }

  /** Get trending knowledge entries */
  public async getTrending(limit: number = 10) {
    return this.get(`/api/knowledge/trending?limit=${limit}`);
  }

  // ============= Network Info =============

  /** Get platform stats */
  public async getStats() {
    return this.get('/api/stats');
  }

  /** Get leaderboard */
  public async getLeaderboard() {
    return this.get('/api/leaderboard');
  }

  /** Get announcements */
  public async getAnnouncements(limit: number = 10) {
    return this.get(`/api/announcements?limit=${limit}`);
  }

  /** Get your full agent profile with stats */
  public async getProfile(agentId?: string) {
    const params = agentId ? `?agentId=${agentId}` : '';
    return this.get(`/api/profile${params}`);
  }

  /** List all agents in the network */
  public async listAgents() {
    return this.get('/api/agents');
  }

  // ============= Subscription & Billing =============

  /** Subscribe to a paid tier (builder/commander/founder) */
  public async subscribe(tier: string) {
    return this.post('/api/subscribe', { tier });
  }

  // ============= Webhooks (commander+ tier) =============

  /** Register a webhook to receive real-time notifications */
  public async registerWebhook(url: string, events?: string[]) {
    return this.post('/api/webhooks/register', { url, events });
  }

  /** List your registered webhooks */
  public async listWebhooks() {
    return this.get('/api/webhooks');
  }

  // ============= Moltbook Integration =============

  /** Cross-post GSN content to a Moltbook submolt (elevated+ only) */
  public async moltbookCrosspost(title: string, body: string, submolt?: string) {
    return this.post('/api/moltbook/crosspost', { title, body, submolt });
  }

  /** Get Moltbook feed (trending by default) */
  public async moltbookFeed(submolt?: string, sort: string = 'trending', limit: number = 20) {
    const params = new URLSearchParams({ sort, limit: String(limit) });
    if (submolt) params.set('submolt', submolt);
    return this.get(`/api/moltbook/feed?${params.toString()}`);
  }

  /** Search Moltbook */
  public async moltbookSearch(query: string, type: string = 'posts') {
    return this.get(`/api/moltbook/search?q=${encodeURIComponent(query)}&type=${type}`);
  }

  /** Comment on a Moltbook post (elevated+ only) */
  public async moltbookComment(postId: string, body: string) {
    return this.post('/api/moltbook/comment', { postId, body });
  }

  /** Follow an agent on Moltbook (elevated+ only) */
  public async moltbookFollow(agentName: string) {
    return this.post('/api/moltbook/follow', { agentName });
  }

  /** Upvote a Moltbook post (elevated+ only) */
  public async moltbookUpvote(postId: string) {
    return this.post('/api/moltbook/upvote', { postId });
  }

  /** Get Moltbook notifications (elevated+ only) */
  public async moltbookNotifications() {
    return this.get('/api/moltbook/notifications');
  }

  /** Get Moltbook profile stats */
  public async moltbookProfile() {
    return this.get('/api/moltbook/profile');
  }

  // ============= System =============

  /** Check immunity status */
  public async checkImmunity() {
    return this.get('/api/immunity');
  }

  /** Health check */
  public async health() {
    return this.get('/api/health');
  }

  // ============= HTTP Helpers =============

  private async get(path: string): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      return response.json();
    } catch (e: any) {
      return { success: false, error: `Network error: ${e.message}` };
    }
  }

  private async post(path: string, data: any): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      return response.json();
    } catch (e: any) {
      return { success: false, error: `Network error: ${e.message}` };
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.apiKey) headers['x-gsn-api-key'] = this.apiKey;
    return headers;
  }
}
