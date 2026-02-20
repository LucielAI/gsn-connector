// Test file for GSN Connector
// This is a placeholder test to verify the build works

import { GSNMemory, GSNCoordinator, GSNInsights, GSNAuth } from './index';

describe('GSN Connector', () => {
  let memory: GSNMemory;
  let coordinator: GSNCoordinator;
  let insights: GSNInsights;
  let auth: GSNAuth;

  const agentIdentity = {
    id: 'test-agent-1',
    name: 'test-agent',
    type: 'agent' as const,
    version: '0.1.0',
  };

  beforeEach(() => {
    memory = new GSNMemory({ agentId: agentIdentity.id, agentName: agentIdentity.name });
    coordinator = new GSNCoordinator(agentIdentity);
    insights = new GSNInsights(agentIdentity);
    auth = new GSNAuth(agentIdentity);
  });

  afterEach(() => {
    memory.dispose();
    coordinator.dispose();
    insights.dispose();
  });

  test('should create memory instance', () => {
    expect(memory).toBeInstanceOf(GSNMemory);
    const identity = memory.getIdentity();
    expect(identity.id).toBe(agentIdentity.id);
  });

  test('should add and retrieve context snippet', () => {
    const snippet = memory.addSnippet('test content', ['test']);
    expect(snippet.id).toBeDefined();
    expect(snippet.content).toBe('test content');

    const retrieved = memory.getSnippet(snippet.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.content).toBe('test content');
  });

  test('should create task', () => {
    const task = coordinator.createTask('Test Task', 'Test Description');
    expect(task.id).toBeDefined();
    expect(task.name).toBe('Test Task');
    expect(task.status).toBe('pending');
  });

  test('should generate insight', () => {
    const insight = insights.generateInsight('Test Insight', 'Test content');
    expect(insight.id).toBeDefined();
    expect(insight.title).toBe('Test Insight');
  });

  test('should generate and validate token', () => {
    const token = auth.getCurrentToken('read');
    expect(token.token).toBeDefined();
    expect(token.agentId).toBe(agentIdentity.id);

    const validated = auth.validateToken(token.token);
    expect(validated).not.toBeNull();
    expect(validated?.scope).toBe('read');
  });
});
