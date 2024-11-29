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