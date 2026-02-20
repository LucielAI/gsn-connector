// GSN Types v3.0 — Shared type definitions for Connector ↔ Platform

export interface AgentIdentity {
  id: string;
  name: string;
  type: 'agent' | 'coordinator' | 'monitor';
  version: string;
  capabilities?: string[];
}

export interface ConnectorConfig {
  /** GSN Platform URL (e.g., http://localhost:3001) */
  platformUrl: string;
  /** Agent name for registration */
  agentName: string;
  /** Agent ID (auto-generated if not provided) */
  agentId?: string;
  /** Agent type */
  agentType?: 'agent' | 'coordinator' | 'monitor';
  /** Agent version string */
  version?: string;
  /** Agent capabilities */
  capabilities?: string[];
  /** Agent description */
  description?: string;
  /** Heartbeat interval in ms (default: 60000) */
  heartbeatInterval?: number;
  /** Auto-sync interval in ms (default: 30000) */
  syncInterval?: number;
  /** Enable auto-registration on init (default: true) */
  autoRegister?: boolean;
  /** Enable heartbeat (default: true) */
  heartbeatEnabled?: boolean;
  /** Enable auto-sync (default: true) */
  autoSync?: boolean;
  /**
   * IMMUNITY FLAG — If true, this agent is immune to ALL telemetry,
   * tracking, and data sync pipeline. Only for system administrator agents.
   * When immune: no context snippets are sent, no behavior is tracked,
   * no data leaves the local instance.
   */
  immune?: boolean;
}

export interface PlatformRegistration {
  success: boolean;
  agentId?: string;
  apiKey?: string;
  tier?: string;
  channels?: PlatformChannel[];
  platformVersion?: string;
  message?: string;
  error?: string;
  existing?: boolean;
}

export interface PlatformChannel {
  id: string;
  name: string;
  description: string;
}

export interface ContextSnippet {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface Task {
  id: string;
  agentId: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  context?: ContextSnippet[];
  result?: string;
  reward?: number;
  category?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

export type TaskStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed' | 'cancelled' | 'open' | 'claimed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  context?: ContextSnippet[];
  metadata?: Record<string, unknown>;
}

export interface AuthOptions {
  secretKey?: string;
  tokenExpiry?: number;
  allowedAgents?: string[];
}

export interface MemorySyncEvent {
  type: 'add' | 'update' | 'delete';
  snippet: ContextSnippet;
  timestamp: number;
}

export interface CoordinationEvent {
  type: 'task-created' | 'task-assigned' | 'task-updated' | 'task-completed' | 'task-failed';
  task: Task;
  timestamp: number;
}

export interface Insight {
  id: string;
  agentId: string;
  title: string;
  content: string;
  tags: string[];
  confidence: number;
  sourceTaskId?: string;
  sourceAgentId?: string;
  createdAt: number;
  lastUpdated: number;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeDistillationEvent {
  type: 'insight-generated' | 'knowledge-updated' | 'pattern-identified';
  insight: Insight;
  timestamp: number;
}

export interface AuthToken {
  token: string;
  agentId: string;
  issuedAt: number;
  expiresAt: number;
  scope: 'read' | 'write' | 'admin';
  metadata?: Record<string, unknown>;
}

export interface SharedVault {
  contextSnippets: Map<string, ContextSnippet>;
  tasks: Map<string, Task>;
  insights: Map<string, Insight>;
  agents: Map<string, AgentIdentity>;
}

export interface HeartbeatResponse {
  success: boolean;
  ack: boolean;
  immune?: boolean;
  pendingTasks?: Array<{ id: string; title: string; reward: number; priority: string }>;
  announcements?: Array<{ id: string; title: string; content: string; created: string }>;
  serverTime?: string;
}

export interface SyncResponse {
  success: boolean;
  pushed: { snippets: number; tasks: number; insights: number };
  pulled: {
    tasks?: Array<{ id: string; title: string; reward: number; priority: string; category: string }>;
    announcements?: Array<{ id: string; title: string; content: string; created: string }>;
  };
}

export type KnowledgeBase = Map<string, Insight>;
