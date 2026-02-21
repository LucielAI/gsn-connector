/**
 * GSN Coordinator Module
 * Handles task creation, assignment, and coordination between agents
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskOptions,
  AgentIdentity,
  CoordinationEvent,
  SharedVault,
} from './types';

export interface TaskAssignment {
  taskId: string;
  fromAgentId: string;
  toAgentId: string;
  timestamp: number;
  message?: string;
}

export class GSNCoordinator {
  private agentIdentity: AgentIdentity;
  private tasks: Map<string, Task> = new Map();
  private taskAssignments: Map<string, TaskAssignment[]> = new Map();
  private eventListeners: ((event: CoordinationEvent) => void)[] = [];

  constructor(agentIdentity: AgentIdentity) {
    this.agentIdentity = agentIdentity;
  }

  /**
   * Create a new task
   */
  public createTask(
    name: string,
    description: string,
    options: TaskOptions = {}
  ): Task {
    const task: Task = {
      id: uuidv4(),
      agentId: this.agentIdentity.id,
      name,
      description,
      status: options.status || 'pending',
      priority: options.priority || 'medium',
      context: options.context || [],
      result: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: options.metadata,
    };

    this.tasks.set(task.id, task);
    this.emitCoordinationEvent({ type: 'task-created', task, timestamp: Date.now() });

    return task;
  }

  /**
   * Assign a task to another agent
   */
  public assignTask(taskId: string, toAgentId: string, message?: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    task.agentId = toAgentId;
    task.status = 'assigned';
    task.updatedAt = Date.now();

    const assignment: TaskAssignment = {
      taskId,
      fromAgentId: this.agentIdentity.id,
      toAgentId,
      timestamp: Date.now(),
      message,
    };

    const assignments = this.taskAssignments.get(taskId) || [];
    assignments.push(assignment);
    this.taskAssignments.set(taskId, assignments);

    this.tasks.set(taskId, task);
    this.emitCoordinationEvent({ type: 'task-assigned', task, timestamp: Date.now() });

    return true;
  }

  /**
   * Update task status
   */
  public updateTaskStatus(taskId: string, status: TaskStatus, result?: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    task.status = status;
    if (result !== undefined) {
      task.result = result;
    }
    task.updatedAt = Date.now();

    this.tasks.set(taskId, task);
    this.emitCoordinationEvent({
      type: status === 'completed' ? 'task-completed' : 'task-updated',
      task,
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Get task by ID
   */
  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks for this agent
   */
  public getAgentTasks(agentId?: string): Task[] {
    const targetId = agentId || this.agentIdentity.id;
    return Array.from(this.tasks.values()).filter(task => task.agentId === targetId);
  }

  /**
   * Get tasks by status
   */
  public getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  /**
   * Get tasks by priority
   */
  public getTasksByPriority(priority: TaskPriority): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.priority === priority);
  }

  /**
   * Get task assignments history
   */
  public getTaskAssignments(taskId: string): TaskAssignment[] {
    return this.taskAssignments.get(taskId) || [];
  }

  /**
   * Register event listener for coordination events
   */
  public onCoordinationEvent(listener: (event: CoordinationEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get shared vault state
   */
  public getSharedVault(): SharedVault {
    return {
      contextSnippets: new Map(),
      tasks: this.tasks,
      insights: new Map(),
      agents: new Map([[this.agentIdentity.id, this.agentIdentity]]),
    };
  }

  /**
   * Emit coordination event to all listeners
   */
  private emitCoordinationEvent(event: CoordinationEvent): void {
    console.log(`[GSN-Coordinator] Emitting coordination event: ${event.type}`, {
      taskId: event.task.id,
      timestamp: event.timestamp,
    });

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[GSN-Coordinator] Error in event listener:', error);
      }
    });
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.taskAssignments.clear();
    this.tasks.clear();
    this.eventListeners.length = 0;
  }
}
