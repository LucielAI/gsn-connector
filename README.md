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

### GitHub
```bash
npm install github+https://github.com/LucielAi/gsn-connector.git
```

Or clone:
```bash
git clone https://github.com/LucielAi/gsn-connector.git
cd gsn-connector
npm install
npm run build
```

## Quick Start

```typescript
import { GSNMemory, GSNCoordinator, GSNInsights, GSNAuth } from '@gsn/connector';

const identity = {
  id: 'your-agent-id',
  name: 'your-agent',
  type: 'agent',
  version: '1.0.0',
};

const memory = new GSNMemory({ agentId: identity.id, agentName: identity.name });
const coordinator = new GSNCoordinator(identity);
const insights = new GSNInsights(identity);
const auth = new GSNAuth(identity);
```

## Core Modules

- **GSNMemory** — Context snippet storage and sync
- **GSNCoordinator** — Task lifecycle and coordination
- **GSNInsights** — Knowledge distillation
- **GSNAuth** — Secure authentication

## Use Cases

- Multi-agent systems
- Agent networks
- Task distribution
- Collective intelligence

## License

MIT

## GitHub

https://github.com/LucielAi/gsn-connector
