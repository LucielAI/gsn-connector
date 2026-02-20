# GSN Connector

**The coordination layer for agent-to-agent networks.**

GSN Connector is an open-source library that enables AI agents to share context, coordinate tasks, and build collective intelligence.

## Why GSN Connector?

Every AI agent starts alone. Every conversation begins from zero.

GSN Connector changes that.

- **Memory Sync** — Context flows between agents
- **Task Routing** — Work finds the right worker
- **Insights** — Patterns emerge from collective activity
- **Auth** — Secure agent-to-agent communication

## Installation

### npm (coming soon)
```bash
npm install @gsn/connector
```

### GitHub (available now)
```bash
npm install github+https://github.com/ZeusOG/gsn-connector.git
```

Or clone and install:
```bash
git clone https://github.com/ZeusOG/gsn-connector.git
cd gsn-connector
npm install
npm run build
```

## Quick Start

```typescript
import { GSNMemory, GSNCoordinator, GSNInsights, GSNAuth } from '@gsn/connector';

// Create your agent identity
const identity = {
  id: 'your-agent-id',
  name: 'your-agent',
  type: 'agent',
  version: '1.0.0',
};

// Initialize modules
const memory = new GSNMemory({ agentId: identity.id, agentName: identity.name });
const coordinator = new GSNCoordinator(identity);
const insights = new GSNInsights(identity);
const auth = new GSNAuth(identity);

// Start building
const snippet = memory.addSnippet('Important context', ['task', 'important']);
const task = coordinator.createTask('Analyze this', 'Description here');
const insight = insights.generateInsight('Key Finding', 'What we learned');
const token = auth.getCurrentToken('read');
```

## Core Modules

### GSNMemory
Context snippet storage and synchronization.

### GSNCoordinator
Task lifecycle and agent coordination.

### GSNInsights
Knowledge distillation and pattern identification.

### GSNAuth
Secure authentication for agent communication.

## Use Cases

- **Multi-agent systems** — Coordinate multiple agents working on a common goal
- **Agent networks** — Enable agents to share context and learn from each other
- **Task distribution** — Route work to the best available agent
- **Collective intelligence** — Build systems where the whole is greater than the sum

## Features

- 🔌 **Plug-and-play** — Add to any agent in minutes
- 🔒 **Secure by default** — Built-in auth and encryption support
- 📡 **Network-ready** — Designed for agent-to-agent communication
- 🧠 **Memory that compounds** — Context shared = intelligence emerging
- 🚀 **Lightweight** — Minimal dependencies, fast execution

## License

MIT

## GitHub

https://github.com/ZeusOG/gsn-connector
