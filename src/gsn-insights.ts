/**
 * GSN Insights Module
 * Handles knowledge distillation and pattern identification
 */

import { v4 as uuidv4 } from 'uuid';
import { Insight, KnowledgeDistillationEvent, AgentIdentity, SharedVault } from '../types';

export interface InsightOptions {
  sourceTaskId?: string;
  sourceAgentId?: string;
  tags?: string[];
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export class GSNInsights {
  private agentIdentity: AgentIdentity;
  private insights: Map<string, Insight> = new Map();
  private knowledgeBase: Map<string, string[]> = new Map(); // tag -> insight IDs
  private eventListeners: ((event: KnowledgeDistillationEvent) => void)[] = [];

  constructor(agentIdentity: AgentIdentity) {
    this.agentIdentity = agentIdentity;
  }

  /**
   * Generate a new insight from context
   */
  public generateInsight(
    title: string,
    content: string,
    options: InsightOptions = {}
  ): Insight {
    const insight: Insight = {
      id: uuidv4(),
      agentId: this.agentIdentity.id,
      title,
      content,
      tags: options.tags || [],
      confidence: options.confidence ?? 0.5,
      sourceTaskId: options.sourceTaskId,
      sourceAgentId: options.sourceAgentId,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      metadata: options.metadata,
    };

    this.insights.set(insight.id, insight);

    // Update knowledge base index
    insight.tags.forEach(tag => {
      const ids = this.knowledgeBase.get(tag) || [];
      if (!ids.includes(insight.id)) {
        ids.push(insight.id);
        this.knowledgeBase.set(tag, ids);
      }
    });

    this.emitInsightEvent({ type: 'insight-generated', insight, timestamp: Date.now() });

    return insight;
  }

  /**
   * Update an existing insight
   */
  public updateInsight(id: string, updates: Partial<Insight>): Insight | null {
    const existing = this.insights.get(id);
    if (!existing) {
      return null;
    }

    const updated: Insight = {
      ...existing,
      ...updates,
      lastUpdated: Date.now(),
    };

    this.insights.set(id, updated);
    this.emitInsightEvent({ type: 'knowledge-updated', insight: updated, timestamp: Date.now() });

    return updated;
  }

  /**
   * Delete an insight
   */
  public deleteInsight(id: string): boolean {
    const insight = this.insights.get(id);
    if (!insight) {
      return false;
    }

    // Remove from knowledge base index
    insight.tags.forEach(tag => {
      const ids = this.knowledgeBase.get(tag) || [];
      const filtered = ids.filter(x => x !== id);
      if (filtered.length > 0) {
        this.knowledgeBase.set(tag, filtered);
      } else {
        this.knowledgeBase.delete(tag);
      }
    });

    this.insights.delete(id);
    return true;
  }

  /**
   * Get insight by ID
   */
  public getInsight(id: string): Insight | undefined {
    return this.insights.get(id);
  }

  /**
   * Get all insights
   */
  public getAllInsights(): Insight[] {
    return Array.from(this.insights.values());
  }

  /**
   * Get insights by tag
   */
  public getInsightsByTag(tag: string): Insight[] {
    const ids = this.knowledgeBase.get(tag) || [];
    return ids
      .map(id => this.insights.get(id))
      .filter((i): i is Insight => i !== undefined);
  }

  /**
   * Get insights by agent ID
   */
  public getInsightsByAgent(agentId: string): Insight[] {
    return Array.from(this.insights.values()).filter(
      insight => insight.agentId === agentId
    );
  }

  /**
   * Search insights by content
   */
  public searchInsights(query: string): Insight[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.insights.values()).filter(insight =>
      insight.title.toLowerCase().includes(lowerQuery) ||
      insight.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Find patterns across insights
   */
  public findPatterns(minConfidence: number = 0.7): Insight[] {
    return Array.from(this.insights.values()).filter(
      insight => insight.confidence >= minConfidence
    );
  }

  /**
   * Get knowledge base statistics
   */
  public getStats(): { total: number; byTag: Record<string, number> } {
    const byTag: Record<string, number> = {};
    this.knowledgeBase.forEach((ids, tag) => {
      byTag[tag] = ids.length;
    });

    return {
      total: this.insights.size,
      byTag,
    };
  }

  /**
   * Get shared vault state
   */
  public getSharedVault(): SharedVault {
    return {
      contextSnippets: new Map(),
      tasks: new Map(),
      insights: this.insights,
      agents: new Map([[this.agentIdentity.id, this.agentIdentity]]),
    };
  }

  /**
   * Register event listener for insight events
   */
  public onInsightEvent(listener: (event: KnowledgeDistillationEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit insight event to all listeners
   */
  private emitInsightEvent(event: KnowledgeDistillationEvent): void {
    console.log(`[GSN-Insights] Emitting insight event: ${event.type}`, {
      insightId: event.insight.id,
      timestamp: event.timestamp,
    });

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[GSN-Insights] Error in event listener:', error);
      }
    });
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.insights.clear();
    this.knowledgeBase.clear();
    this.eventListeners.length = 0;
  }
}
