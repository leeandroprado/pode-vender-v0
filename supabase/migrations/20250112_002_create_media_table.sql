-- Migration: Create Media Table for Shared Files
-- Created: 2025-01-12
-- Purpose: Store shared files, images, videos, and documents in conversations

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File information
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'document', 'other'
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- in bytes
  file_url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT, -- For images and videos
  
  -- Metadata
  width INTEGER, -- For images/videos
  height INTEGER, -- For images/videos
  duration INTEGER, -- For audio/video (in seconds)
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for performance
CREATE INDEX idx_media_conversation ON media(conversation_id, uploaded_at DESC);
CREATE INDEX idx_media_user ON media(user_id, uploaded_at DESC);
CREATE INDEX idx_media_type ON media(conversation_id, file_type);
CREATE INDEX idx_media_message ON media(message_id) WHERE message_id IS NOT NULL;

-- Add RLS policies
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Users can view media from their own conversations
CREATE POLICY "Users can view their conversation media"
  ON media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = media.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can insert media to their own conversations
CREATE POLICY "Users can upload media to their conversations"
  ON media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = media.conversation_id
      AND conversations.user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can delete their own media
CREATE POLICY "Users can delete their own media"
  ON media FOR DELETE
  USING (user_id = auth.uid());

-- Add comments
COMMENT ON TABLE media IS 'Stores shared files, images, videos, and documents in conversations';
COMMENT ON COLUMN media.file_type IS 'Type of file: image, video, audio, document, other';
COMMENT ON COLUMN media.file_size IS 'File size in bytes';
COMMENT ON COLUMN media.duration IS 'Duration in seconds for audio/video files';
