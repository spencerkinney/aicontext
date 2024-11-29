// src/AIChatContext.ts
import type { 
    AIChatMessageData, 
    FilterOptions, 
    AIChatContextOptions,
    MessageData 
} from './types';
import { AIChatMessage } from './AIChatMessage';

export class AIChatContext {
    private readonly messages: AIChatMessage[] = [];
    private readonly systemPrompt?: string;
    private readonly maxMessages?: number;

    constructor(options: AIChatContextOptions = {}) {
        this.systemPrompt = options.systemPrompt;
        this.maxMessages = options.maxMessages;

        if (options.messages) {
            this.loadMessages(options.messages);
        }
    }

    private parseMessages(input: string | AIChatMessageData[]): AIChatMessageData[] {
        if (typeof input === 'string') {
            try {
                const data = JSON.parse(input) as MessageData;
                if (!Array.isArray(data.messages)) {
                    throw new Error('Invalid messages format');
                }
                return data.messages;
            } catch (error) {
                throw new Error('Failed to parse messages: ' + (error as Error).message);
            }
        }
        return input;
    }

    add(content: string, role = 'user', assistant_name = 'default'): void {
        this.messages.push(new AIChatMessage(role, content, assistant_name));
        
        if (this.maxMessages && this.messages.length > this.maxMessages) {
            this.messages.splice(0, this.messages.length - this.maxMessages);
        }
    }

    filter(options: FilterOptions = {}): AIChatMessageData[] {
        let filtered = [...this.messages];

        if (options.assistant_name) {
            filtered = filtered.filter(m => m.assistant_name === options.assistant_name);
        }
        if (options.role) {
            filtered = filtered.filter(m => m.role === options.role);
        }
        if (options.offset) {
            filtered = filtered.slice(options.offset);
        }
        if (options.limit) {
            filtered = filtered.slice(0, options.limit);
        }

        return filtered.map(m => ({
            role: m.role,
            content: m.content
        }));
    }

    getMessages(): AIChatMessageData[] {
        return this.messages.map(m => ({
            role: m.role,
            content: m.content
        }));
    }

    format(options: FilterOptions = {}): string {
        const messages: string[] = [];
        
        if (this.systemPrompt) {
            messages.push(`System: ${this.systemPrompt}`);
        }

        const filtered = this.filter(options);
        messages.push(...filtered.map(msg => 
            new AIChatMessage(
                msg.role,
                msg.content,
                options.assistant_name ?? 'default'
            ).formatMessage()
        ));

        return messages.join('\n\n');
    }

    latest(assistant_name?: string): string | undefined {
        const messages = this.filter({ assistant_name, limit: 1 });
        return messages[0]?.content;
    }

    toJSON(): string {
        return JSON.stringify({
            system_prompt: this.systemPrompt,
            messages: this.messages.map(m => m.toDict())
        });
    }

    loadMessages(messages: AIChatMessageData[] | string): void {
        try {
            const parsedMessages = this.parseMessages(messages);
            
            this.messages.length = 0;
            this.messages.push(...parsedMessages.map(msg => AIChatMessage.fromDict(msg)));
        } catch (error) {
            throw new Error(`Failed to load messages: ${(error as Error).message}`);
        }
    }

    clear(assistant_name?: string): void {
        if (assistant_name) {
            this.messages.splice(
                0, 
                this.messages.length, 
                ...this.messages.filter(m => m.assistant_name !== assistant_name)
            );
        } else {
            this.messages.length = 0;
        }
    }

    getSystemPrompt(): string | undefined {
        return this.systemPrompt;
    }

    getMaxMessages(): number | undefined {
        return this.maxMessages;
    }
}