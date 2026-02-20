# GSN Connector - Agent Context Snippet Example

This example demonstrates how agents can share context snippets and coordinate tasks.

## Setup

```typescript
import {
  GSNMemory,
  GSNCoordinator,
  GSNInsights,
  GSNAuth,
} from '@gsn/connector';

// Agent 1: Research Agent
const researchAgent = {
  id: 'agent-research-1',
  name: 'research-agent',
  type: 'agent' as const,
  version: '0.1.0',
};

// Agent 2: Task Agent
const taskAgent = {
  id: 'agent-task-1',
  name: 'task-agent',
  type: 'agent' as const,
  version: '0.1.0',
};
```

## Sharing Context

```typescript
// Agent 1 adds context snippet
const memory1 = new GSNMemory({ agentId: researchAgent.id, agentName: researchAgent.name });
const snippet = memory1.addSnippet(
  'Found relevant research paper on quantum computing',
  ['quantum', 'research', 'paper'],
  { url: 'https://example.com/paper.pdf' }
);

// Agent 2 can access this context
const memory2 = new GSNMemory({ agentId: taskAgent.id, agentName: taskAgent.name });
// In real implementation, this would sync from shared vault

const relevantSnippets = memory2.getSnippetsByTags(['quantum']);
console.log(relevantSnippets); // Would contain the research snippet
```

## Task Coordination

```typescript
// Agent 2 creates a task
const coordinator2 = new GSNCoordinator(taskAgent);
const task = coordinator2.createTask(
  'Process Research Paper',
  'Analyze the quantum computing paper for key insights',
  {
    priority: 'high',
    context: [snippet],
  }
);

// Assign to research agent
coordinator2.assignTask(task.id, researchAgent.id, 'Please analyze this paper');
```

## Knowledge Distillation

```typescript
// Research agent generates insight
const insights1 = new GSNInsights(researchAgent);
const insight = insights1.generateInsight(
  'Quantum Error Correction Breakthrough',
  'New method reduces error rates by 40%',
  {
    sourceTaskId: task.id,
    sourceAgentId: taskAgent.id,
    tags: ['quantum', 'error-correction', 'breakthrough'],
    confidence: 0.85,
  }
);
```

## Authentication

```typescript
// Agent 1 generates auth token
const auth1 = new GSNAuth(researchAgent);
const token = auth1.getCurrentToken('write');

// Agent 2 validates token before accepting task assignment
const auth2 = new GSNAuth(taskAgent);
const isValid = auth2.validateToken(token.token);

if (isValid) {
  console.log('Token is valid, task assignment accepted');
}
```

## Complete Workflow

```typescript
// 1. Research agent shares context
const context = memory1.addSnippet(
  'New quantum computing algorithm published',
  ['quantum', 'algorithm'],
  { title: 'Efficient Quantum Algorithm' }
);

// 2. Task agent creates task with context
const task = coordinator2.createTask(
  'Evaluate Algorithm',
  'Assess the new algorithm for practical applications',
  { context: [context], priority: 'high' }
);

// 3. Task agent assigns to research agent
coordinator2.assignTask(task.id, researchAgent.id);

// 4. Research agent works on task and generates insight
const insight = insights1.generateInsight(
  'Algorithm Efficiency Analysis',
  'The algorithm shows 30% improvement in time complexity',
  { sourceTaskId: task.id }
);

// 5. Task agent marks task as completed
coordinator2.updateTaskStatus(task.id, 'completed', insight.content);
```