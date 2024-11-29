// src/AIChatMessage.ts
import type { AIChatMessageData } from './types';

const ROLE_DISPLAY: Record<string, string> = {
    system: 'System',
    user: 'Human',
    assistant: 'Assistant'
} as const;

export class AIChatMessage {
    constructor(
        readonly role: string,
        readonly content: string,
        readonly assistant_name: string = 'default',
        readonly timestamp: Date = new Date()
    ) {}

    formatMessage(): string {
        const displayRole = ROLE_DISPLAY[this.role] || 
            this.role.charAt(0).toUpperCase() + this.role.slice(1);
        
        return this.assistant_name === 'default'
            ? `${displayRole}: ${this.content}`
            : `${displayRole} (${this.assistant_name}): ${this.content}`;
    }

    toDict(): AIChatMessageData {
        return {
            role: this.role,
            content: this.content,
            assistant_name: this.assistant_name,
            timestamp: this.timestamp.toISOString()
        };
    }

    static fromDict(data: AIChatMessageData): AIChatMessage {
        return new AIChatMessage(
            data.role,
            data.content,
            data.assistant_name,
            data.timestamp ? new Date(data.timestamp) : undefined
        );
    }
}