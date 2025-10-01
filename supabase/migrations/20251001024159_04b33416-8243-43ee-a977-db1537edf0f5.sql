-- Add new AI models to the enum
ALTER TYPE ai_model ADD VALUE IF NOT EXISTS 'x-ai/grok-code-fast-1';
ALTER TYPE ai_model ADD VALUE IF NOT EXISTS 'x-ai/grok-4-fast:free';
ALTER TYPE ai_model ADD VALUE IF NOT EXISTS 'deepseek/deepseek-chat-v3-0324';