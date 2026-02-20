# GSN Connector Build and Test

## Build the Package

```bash
cd /app/workspace/gsn-connector
npm install
npm run build
```

## Run Tests

```bash
npm test
npm run test:watch
```

## Linting

```bash
npm run lint
npm run lint:fix
```

## Build Output

The compiled JavaScript files will be generated in the `lib/` directory.

## Package Structure

```
gsn-connector/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── gsn-memory.ts
│   ├── gsn-coordinator.ts
│   ├── gsn-insights.ts
│   └── gsn-auth.ts
├── lib/
│   ├── index.js
│   ├── types.js
│   ├── gsn-memory.js
│   ├── gsn-coordinator.js
│   ├── gsn-insights.js
│   └── gsn-auth.js
└── test/
    └── gsn-connector.test.ts
```

## Use in Other Projects

```javascript
const { GSNMemory, GSNCoordinator, GSNInsights, GSNAuth } = require('@gsn/connector');

// Initialize with agent identity
const agentIdentity = {
  id: 'agent-1',
  name: 'my-agent',
  type: 'agent',
  version: '0.1.0',
};

const memory = new GSNMemory({ agentId: agentIdentity.id });
const coordinator = new GSNCoordinator(agentIdentity);
const insights = new GSNInsights(agentIdentity);
const auth = new GSNAuth(agentIdentity);
```