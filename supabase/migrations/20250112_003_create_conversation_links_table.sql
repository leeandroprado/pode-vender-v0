-- Migration: Create Conversation Links Table
-- Created: 2025-01-12
-- Purpose: Store and track links shared in conversations

CREATE TABLE IF NOT EXISTS conversation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Link information
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  domain TEXT,
  
  -- Timestamps
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Prevent duplicate links in same conversation
  UNIQUE(conversation_id, url)
);

-- Add indexes for performance
CREATE INDEX idx_conversation_links_conversation ON conversation_links(conversation_id, shared_at DESC);
CREATE INDEX idx_conversation_links_user ON conversation_links(user_id, shared_at DESC);
CREATE INDEX idx_conversation_links_domain ON conversation_links(conversation_id, domain);
CREATE INDEX idx_conversation_links_message ON conversation_links(message_id) WHERE message_id IS NOT NULL;

-- Add RLS policies
ALTER TABLE conversation_links ENABLE ROW LEVEL SECURITY;

-- Users can view links from their own conversations
CREATE POLICY "Users can view their conversation links"
  ON conversation_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_links.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can insert links to their own conversations
CREATE POLICY "Users can add links to their conversations"
  ON conversation_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_links.conversation_id
      AND conversations.user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can delete their own links
CREATE POLICY "Users can delete their own links"
  ON conversation_links FOR DELETE
  USING (user_id = auth.uid());

-- Add comments
COMMENT ON TABLE conversation_links IS 'Stores links shared in conversations with metadata';
COMMENT ON COLUMN conversation_links.domain IS 'Extracted domain from URL for grouping';
COMMENT ON COLUMN conversation_links.title IS 'Page title from Open Graph or meta tags';
