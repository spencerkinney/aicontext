// src/types.ts
export interface AIChatMessageData {
    role: string;
    content: string;
    assistant_name?: string;
    timestamp?: string;
}

export interface FilterOptions {
    assistant_name?: string;
    role?: string;
    limit?: number;
    offset?: number;
}

export interface ChatResponse {
    content?: Array<{ text: string }>;
    choices?: Array<{ message: { content: string } }>;
}

export interface AIChatContextOptions {
    systemPrompt?: string;
    maxMessages?: number;
    messages?: AIChatMessageData[] | string;
}

export interface MessageData {
    system_prompt?: string;
    messages: AIChatMessageData[];
}