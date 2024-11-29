// src/decorators.ts
import type { AIChatContext } from './AIChatContext';
import type { ChatResponse } from './types';

export function aiChatContext(
    context: AIChatContext,
    assistant_name = 'default'
): MethodDecorator {
    return function (
        _target: any,
        _propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            const [prompt] = args;
            
            if (typeof prompt !== 'string') {
                throw new TypeError('First argument must be a string prompt');
            }

            context.add(prompt, 'user', assistant_name);

            const response = await originalMethod.apply(this, args) as ChatResponse;
            
            const content = response.content?.[0]?.text ?? 
                          response.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('Unsupported API response format');
            }

            context.add(content, 'assistant', assistant_name);
            return response;
        };

        return descriptor;
    };
}