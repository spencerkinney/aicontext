"""
aicontext: Simple context management for AI conversations
Version: 0.0.1
"""
from typing import Callable, Optional, List, Dict, Union
from dataclasses import dataclass, field
from functools import wraps
from datetime import datetime
import json

@dataclass(frozen=True)
class AIChatMessage:
    """An immutable message in an AI chat conversation."""
    role: str
    content: str
    assistant_name: str = "default"
    timestamp: datetime = field(default_factory=datetime.now)
    
    def format_message(self) -> str:
        """Format message for display."""
        role_display = {
            "system": "System",
            "user": "Human",
            "assistant": "Assistant"
        }.get(self.role, self.role.capitalize())
        
        if self.assistant_name == "default":
            return f"{role_display}: {self.content}"
        return f"{role_display} ({self.assistant_name}): {self.content}"
    
    def to_dict(self) -> Dict:
        """Convert message to dictionary for serialization."""
        return {
            "role": self.role,
            "content": self.content,
            "assistant_name": self.assistant_name,
            "timestamp": self.timestamp.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'AIChatMessage':
        """Create message from dictionary."""
        return cls(
            role=data["role"],
            content=data["content"],
            assistant_name=data.get("assistant_name", "default"),
            timestamp=datetime.fromisoformat(data["timestamp"]) if "timestamp" in data else datetime.now()
        )

class AIChatContext:
    """Manages conversation context for AI chat applications."""
    
    def __init__(
        self, 
        system_prompt: Optional[str] = None, 
        max_messages: Optional[int] = None,
        messages: Optional[Union[List[Dict], str]] = None
    ):
        """
        Initialize context manager.
        
        Args:
            system_prompt: Initial system instructions
            max_messages: Maximum messages to retain
            messages: Optional list of messages or JSON string to initialize with
        """
        self._messages: List[AIChatMessage] = []
        self.system_prompt = system_prompt
        self.max_messages = max_messages
        
        if messages:
            self.load_messages(messages)
    
    def add(self, content: str, role: str = "user", assistant_name: str = "default") -> None:
        """Add a message to the conversation."""
        self._messages.append(AIChatMessage(role=role, content=content, assistant_name=assistant_name))
        if self.max_messages:
            self._messages = self._messages[-self.max_messages:]
    
    def filter(
        self,
        assistant_name: Optional[str] = None,
        role: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[Dict[str, str]]:
        """
        Filter messages using familiar ORM-like syntax.
        
        Example:
            context.filter(assistant_name="Claude", limit=5)
            context.filter(role="user", offset=2)
        """
        messages = self._messages
        
        if assistant_name:
            messages = [m for m in messages if m.assistant_name == assistant_name]
        if role:
            messages = [m for m in messages if m.role == role]
        if offset:
            messages = messages[offset:]
        if limit:
            messages = messages[:limit]
            
        return [{"role": m.role, "content": m.content} for m in messages]
    
    def get_messages(self) -> List[Dict[str, str]]:
        """Get all messages for API calls."""
        return [{"role": m.role, "content": m.content} for m in self._messages]
    
    def format(self, **kwargs) -> str:
        """Get formatted conversation history with optional filtering."""
        messages = []
        if self.system_prompt:
            messages.append(f"System: {self.system_prompt}")
        
        filtered = self.filter(**kwargs)
        messages.extend(
            AIChatMessage(**msg, assistant_name=kwargs.get("assistant_name", "default")).format_message()
            for msg in filtered
        )
        return "\n\n".join(messages)
    
    def latest(self, assistant_name: Optional[str] = None) -> Optional[str]:
        """Get latest message content with optional assistant filter."""
        messages = self.filter(assistant_name=assistant_name, limit=1)
        return messages[0]["content"] if messages else None
    
    def to_json(self) -> str:
        """Export context to JSON string."""
        data = {
            "system_prompt": self.system_prompt,
            "messages": [m.to_dict() for m in self._messages]
        }
        return json.dumps(data)
    
    def load_messages(self, messages: Union[List[Dict], str]) -> None:
        """Load messages from list of dicts or JSON string."""
        if isinstance(messages, str):
            data = json.loads(messages)
            messages = data.get("messages", [])
            self.system_prompt = data.get("system_prompt")
        
        self._messages = [
            AIChatMessage.from_dict(msg) if isinstance(msg, dict) else msg 
            for msg in messages
        ]
    
    def clear(self, assistant_name: Optional[str] = None) -> None:
        """Clear messages with optional assistant filter."""
        if assistant_name:
            self._messages = [m for m in self._messages if m.assistant_name != assistant_name]
        else:
            self._messages.clear()

def ai_chat_context(context: AIChatContext, assistant_name: str = "default"):
    """Decorator for managing chat context."""
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(prompt: str, *args, **kwargs):
            context.add(prompt, role="user", assistant_name=assistant_name)
            response = func(prompt, *args, **kwargs)
            
            content = (
                response.content[0].text if hasattr(response, "content")  # Anthropic
                else response.choices[0].message.content  # OpenAI
            )
            
            context.add(content, role="assistant", assistant_name=assistant_name)
            return response
        return wrapper
    return decorator