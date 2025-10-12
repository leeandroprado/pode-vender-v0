-- Migration: Add Performance Indexes for Conversations
-- Created: 2025-01-12
-- Purpose: Improve query performance for conversations and messages

-- Index for conversations ordered by last_message_at (most common query)
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at 
  ON conversations(last_message_at DESC NULLS LAST);

-- Index for filtering conversations by user and status
CREATE INDEX IF NOT EXISTS idx_conversations_user_status 
  ON conversations(user_id, status) 
  WHERE status IN ('open', 'waiting');

-- Index for messages by conversation and timestamp (for chat history)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp 
  ON messages(conversation_id, timestamp ASC);

-- Index for messages by sender type (for filtering AI vs human messages)
CREATE INDEX IF NOT EXISTS idx_messages_sender_type 
  ON messages(conversation_id, sender_type);

-- Index for client lookups in conversations
CREATE INDEX IF NOT EXISTS idx_conversations_client_id 
  ON conversations(client_id) 
  WHERE client_id IS NOT NULL;

-- Composite index for common conversation queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated 
  ON conversations(user_id, updated_at DESC);

-- Add comments for documentation
COMMENT ON INDEX idx_conversations_last_message_at IS 'Optimizes conversation list ordering by last message time';
COMMENT ON INDEX idx_conversations_user_status IS 'Optimizes filtering conversations by user and status';
COMMENT ON INDEX idx_messages_conversation_timestamp IS 'Optimizes message retrieval for chat history';
COMMENT ON INDEX idx_messages_sender_type IS 'Optimizes filtering messages by sender type';
COMMENT ON INDEX idx_conversations_client_id IS 'Optimizes client-conversation lookups';
COMMENT ON INDEX idx_conversations_user_updated IS 'Optimizes user conversation queries with sorting';
