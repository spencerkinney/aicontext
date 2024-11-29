# AIContext

Simple context management for AI chat applications. Handles message history and formatting across different LLM providers.

## Installation

```bash
npm install @spencerkinney/aicontext
```

## Example
```typescript
import { AIChatContext, aiChatContext } from '@spencerkinneydev/aicontext';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize clients and context
const context = new AIChatContext({ systemPrompt: "You are a helpful assistant." });
const openai = new OpenAI();
const anthropic = new Anthropic();

class AIClient {
    @aiChatContext(context)
    async askGPT(prompt: string) {
        return openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: context.getSystemPrompt() },
                ...context.getMessages()
            ]
        });
    }

    @aiChatContext(context)
    async askClaude(prompt: string) {
        return anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: context.getMessages()
        });
    }
}

// Use in async context
const ai = new AIClient();
await ai.askGPT("What's the capital of France?");
await ai.askClaude("What's interesting about it?");
console.log(context.format());  // Print conversation
```

## More Examples

### Named Assistants
```typescript
class AISpecialists {
    @aiChatContext(context, "Researcher")
    async researcher(prompt: string) {
        return anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: context.getMessages()
        });
    }

    @aiChatContext(context, "Coder")
    async coder(prompt: string) {
        return openai.chat.completions.create({
            model: "gpt-4",
            messages: context.getMessages()
        });
    }
}

const specialists = new AISpecialists();

// Use different assistants
await specialists.researcher("Explain quantum computing");
await specialists.coder("Show me a quantum random number generator");

// Get messages by assistant
console.log(context.format({ assistant_name: "Researcher" }));
console.log(context.latest("Coder"));
```

### Message Filtering
```typescript
// Last 5 messages
console.log(context.format({ limit: 5 }));

// Filter by assistant and role
console.log(context.format({
    assistant_name: "Researcher",
    role: "assistant",
    limit: 2
}));

// Get raw messages for API
const messages = context.getMessages();
```

### Save & Load
```typescript
// Save context
const saved = context.toJSON();

// Load in new context
const newContext = new AIChatContext({ messages: saved });
```

## API Reference

### AIChatContext
```typescript
new AIChatContext({
    systemPrompt?: string;    // System instructions
    maxMessages?: number;     // Message limit
    messages?: AIChatMessageData[] | string;  // Load existing
})
```

#### Methods
| Method | Description |
|--------|-------------|
| `getMessages()` | Get messages for API calls |
| `filter(options)` | Filter messages |
| `format(options?)` | Get formatted history |
| `latest(assistant_name?)` | Get latest message |
| `toJSON()` | Export to JSON |
| `loadMessages(messages)` | Load messages |
| `clear(assistant_name?)` | Clear history |
| `getSystemPrompt()` | Get system prompt |
| `getMaxMessages()` | Get message limit |

### Decorator
```typescript
@aiChatContext(
    context: AIChatContext,         // Context instance
    assistant_name?: string = "default" // Optional name
)
```

### Filtering Options
```typescript
interface FilterOptions {
    assistant_name?: string;  // Filter by assistant
    role?: string;           // Filter by role
    limit?: number;          // Limit results
    offset?: number;         // Skip messages
}
```

### Using with JavaScript
```javascript
const { AIChatContext, aiChatContext } = require('@spencerkinneydev/aicontext');

class AIClient {
    constructor() {
        this.context = new AIChatContext({ systemPrompt: "You are a helpful assistant." });
    }

    askGPT = aiChatContext(this.context)(async function(prompt) {
        // OpenAI implementation
    });
}
```

## License

MIT
