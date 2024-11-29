# AIContext

Simple context management for AI chat applications. Handles message history and formatting across different LLM providers.

## Example
```python
from aicontext import AIChatContext, ai_chat_context
from openai import OpenAI
from anthropic import Anthropic

# Initialize
context = AIChatContext(system_prompt="You are a helpful assistant.")
openai, anthropic = OpenAI(), Anthropic()

# Create chat functions
@ai_chat_context(context)
def ask_gpt(prompt: str):
    return openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": context.system_prompt}] + context.get_messages()
    )

@ai_chat_context(context)
def ask_claude(prompt: str):
    return anthropic.messages.create(
        model="claude-3-5-sonnet-20240620",
        system=context.system_prompt,
        messages=context.get_messages(),
        max_tokens=1024
    )

# Chat with different models
ask_gpt("What's the capital of France?")
ask_claude("What's interesting about it?")
print(context.format())  # Print conversation
```

## More Examples

### Named Assistants
```python
@ai_chat_context(context, assistant_name="Researcher")
def researcher(prompt: str):
    return anthropic.messages.create(
        model="claude-3-5-sonnet-20240620",
        system=context.system_prompt,
        messages=context.get_messages(),
        max_tokens=1024
    )

@ai_chat_context(context, assistant_name="Coder")
def coder(prompt: str):
    return openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": context.system_prompt}] + context.get_messages()
    )

# Use different assistants
researcher("Explain quantum computing")
coder("Show me a quantum random number generator")

# Get messages by assistant
print(context.format(assistant_name="Researcher"))
print(context.latest(assistant_name="Coder"))
```

### Message Filtering
```python
# Last 5 messages
print(context.format(limit=5))

# Filter by assistant and role
print(context.format(
    assistant_name="Researcher",
    role="assistant",
    limit=2
))

# Get raw messages for API
messages = context.get_messages()
```

### Save & Load
```python
# Save context
saved = context.to_json()

# Load in new context
new_context = AIChatContext(messages=saved)
```

## Installation

```bash
pip install aicontext
```

## API Reference

### AIChatContext
```python
AIChatContext(
    system_prompt: Optional[str] = None,    # System instructions
    max_messages: Optional[int] = None,     # Message limit
    messages: Optional[Union[List[Dict], str]] = None  # Load existing
)
```

#### Methods
| Method | Description |
|--------|-------------|
| `get_messages()` | Get messages for API calls |
| `filter(assistant_name=None, role=None, limit=None)` | Filter messages |
| `format(**kwargs)` | Get formatted history |
| `latest(assistant_name=None)` | Get latest message |
| `to_json()` | Export to JSON |
| `load_messages(messages)` | Load messages |
| `clear(assistant_name=None)` | Clear history |

### Decorator
```python
@ai_chat_context(
    context: AIChatContext,         # Context instance
    assistant_name: str = "default" # Optional name
)
```

### Filtering Options
```python
context.filter(
    assistant_name="Researcher",  # Filter by assistant
    role="assistant",            # Filter by role
    limit=5,                     # Limit results
    offset=2                     # Skip messages
)
```

## License

MIT
