// GSN Types - Shared type definitions

export interface AgentIdentity {
  id: string;
  name: string;
  type: 'agent' | 'coordinator' | 'monitor';
  version: string;
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
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

export type TaskStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

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

export interface ConnectorConfig {
  vaultUrl?: string;
  syncInterval?: number;
  authEnabled?: boolean;
  agentId?: string;
  agentName?: string;
  agentType?: 'agent' | 'coordinator' | 'monitor';
  version?: string;
}
