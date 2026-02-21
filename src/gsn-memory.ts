/**
 * GSN Memory Module
 * Handles context snippet storage and synchronization with shared vault
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ContextSnippet,
  MemorySyncEvent,
  AgentIdentity,
  SharedVault,
} from './types';

export interface MemoryOptions {
  agentId?: string;
  agentName?: string;
  syncWithVault?: boolean;
  vaultUrl?: string;
  autoSync?: boolean;
}

export class GSNMemory {
  private agentIdentity: AgentIdentity;
  private contextSnippets: Map<string, ContextSnippet> = new Map();
  private syncWithVault: boolean;
  private vaultUrl?: string;
  private autoSync: boolean;
  private syncInterval?: NodeJS.Timeout;

  constructor(options: MemoryOptions = {}) {
    this.agentIdentity = {
      id: options.agentId || uuidv4(),
      name: options.agentName || 'default-agent',
      type: 'agent',
      version: '0.1.0',
    };
    this.syncWithVault = options.syncWithVault ?? true;
    this.vaultUrl = options.vaultUrl;
    this.autoSync = options.autoSync ?? true;
  }

  /**
   * Get current agent identity
   */
  public getIdentity(): AgentIdentity {
    return this.agentIdentity;
  }

  /**
   * Add a new context snippet
   */
  public addSnippet(content: string, tags: string[] = [], metadata?: Record<string, unknown>): ContextSnippet {
    const snippet: ContextSnippet = {
      id: uuidv4(),
      agentId: this.agentIdentity.id,
      content,
      timestamp: Date.now(),
      tags,
      metadata,
    };

    this.contextSnippets.set(snippet.id, snippet);
    this.emitSyncEvent({ type: 'add', snippet, timestamp: Date.now() });

    return snippet;
  }

  /**
   * Update an existing context snippet
   */
  public updateSnippet(id: string, updates: Partial<ContextSnippet>): ContextSnippet | null {
    const existing = this.contextSnippets.get(id);
    if (!existing) {
      return null;
    }

    const updated: ContextSnippet = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    this.contextSnippets.set(id, updated);
    this.emitSyncEvent({ type: 'update', snippet: updated, timestamp: Date.now() });

    return updated;
  }

  /**
   * Delete a context snippet
   */
  public deleteSnippet(id: string): boolean {
    if (this.contextSnippets.delete(id)) {
      this.emitSyncEvent({ type: 'delete', snippet: { id, agentId: this.agentIdentity.id, content: '', timestamp: Date.now(), tags: [] } as ContextSnippet, timestamp: Date.now() });
      return true;
    }
    return false;
  }

  /**
   * Get a context snippet by ID
   */
  public getSnippet(id: string): ContextSnippet | undefined {
    return this.contextSnippets.get(id);
  }

  /**
   * Get all context snippets
   */
  public getAllSnippets(): ContextSnippet[] {
    return Array.from(this.contextSnippets.values());
  }

  /**
   * Get snippets by tag
   */
  public getSnippetsByTags(tags: string[]): ContextSnippet[] {
    return Array.from(this.contextSnippets.values()).filter(snippet =>
      tags.some(tag => snippet.tags.includes(tag))
    );
  }

  /**
   * Search snippets by a single tag — convenience method for getSnippetsByTags
   */
  public searchByTag(tag: string): ContextSnippet[] {
    return Array.from(this.contextSnippets.values()).filter(
      snippet => snippet.tags.includes(tag)
    );
  }

  /**
   * Get snippets by agent ID
   */
  public getSnippetsByAgent(agentId: string): ContextSnippet[] {
    return Array.from(this.contextSnippets.values()).filter(
      snippet => snippet.agentId === agentId
    );
  }

  /**
   * Search snippets by content
   */
  public searchSnippets(query: string): ContextSnippet[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.contextSnippets.values()).filter(snippet =>
      snippet.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get shared vault state
   */
  public getSharedVault(): SharedVault {
    return {
      contextSnippets: this.contextSnippets,
      tasks: new Map(),
      insights: new Map(),
      agents: new Map([[this.agentIdentity.id, this.agentIdentity]]),
    };
  }

  /**
   * Synchronize with shared vault (placeholder for network sync)
   */
  public async syncWithSharedVault(): Promise<void> {
    if (!this.syncWithVault || !this.vaultUrl) {
      return;
    }

    // TODO: Implement actual vault synchronization
    console.log(`[GSN-Memory] Syncing with vault at ${this.vaultUrl}`);
    // In real implementation, this would make network calls to synchronize state
  }

  /**
   * Start automatic synchronization
   */
  public startAutoSync(interval: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (this.autoSync && this.syncWithVault) {
      this.syncInterval = setInterval(() => {
        this.syncWithSharedVault();
      }, interval);
    }
  }

  /**
   * Stop automatic synchronization
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Emit synchronization event
   */
  private emitSyncEvent(event: MemorySyncEvent): void {
    console.log(`[GSN-Memory] Emitting sync event: ${event.type}`, {
      snippetId: event.snippet.id,
      timestamp: event.timestamp,
    });

    // In real implementation, this would emit to event bus or pub/sub system
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stopAutoSync();
    this.contextSnippets.clear();
  }
}
