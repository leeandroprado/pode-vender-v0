-- Migration: Add Analytics Columns to Conversations
-- Created: 2025-01-12
-- Purpose: Track conversation metrics for better insights

-- Add analytics columns to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS media_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS link_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_response_time INTERVAL,
ADD COLUMN IF NOT EXISTS avg_response_time INTERVAL,
ADD COLUMN IF NOT EXISTS last_human_message_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_ai_message_at TIMESTAMPTZ;

-- Create function to update message count
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations
    SET message_count = message_count + 1,
        last_message_at = NEW.timestamp
    WHERE id = NEW.conversation_id;
    
    -- Update last AI or human message timestamp
    IF NEW.sender_type = 'ai' THEN
      UPDATE conversations
      SET last_ai_message_at = NEW.timestamp
      WHERE id = NEW.conversation_id;
    ELSIF NEW.sender_type IN ('client', 'system') THEN
      UPDATE conversations
      SET last_human_message_at = NEW.timestamp
      WHERE id = NEW.conversation_id;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE conversations
    SET message_count = GREATEST(message_count - 1, 0)
    WHERE id = OLD.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message count
DROP TRIGGER IF EXISTS trigger_update_message_count ON messages;
CREATE TRIGGER trigger_update_message_count
  AFTER INSERT OR DELETE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_message_count();

-- Create function to update media count
CREATE OR REPLACE FUNCTION update_conversation_media_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations
    SET media_count = media_count + 1
    WHERE id = NEW.conversation_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE conversations
    SET media_count = GREATEST(media_count - 1, 0)
    WHERE id = OLD.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for media count (will work after media table is created)
DROP TRIGGER IF EXISTS trigger_update_media_count ON media;
CREATE TRIGGER trigger_update_media_count
  AFTER INSERT OR DELETE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_media_count();

-- Create function to update link count
CREATE OR REPLACE FUNCTION update_conversation_link_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations
    SET link_count = link_count + 1
    WHERE id = NEW.conversation_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE conversations
    SET link_count = GREATEST(link_count - 1, 0)
    WHERE id = OLD.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for link count (will work after conversation_links table is created)
DROP TRIGGER IF EXISTS trigger_update_link_count ON conversation_links;
CREATE TRIGGER trigger_update_link_count
  AFTER INSERT OR DELETE ON conversation_links
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_link_count();

-- Initialize counts for existing conversations
UPDATE conversations c
SET message_count = (
  SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id
),
media_count = 0, -- Will be updated when media table is populated
link_count = 0; -- Will be updated when links table is populated

-- Add comments
COMMENT ON COLUMN conversations.message_count IS 'Total number of messages in conversation';
COMMENT ON COLUMN conversations.media_count IS 'Total number of media files shared';
COMMENT ON COLUMN conversations.link_count IS 'Total number of links shared';
COMMENT ON COLUMN conversations.first_response_time IS 'Time taken for first response';
COMMENT ON COLUMN conversations.avg_response_time IS 'Average response time';
COMMENT ON COLUMN conversations.last_human_message_at IS 'Timestamp of last human message';
COMMENT ON COLUMN conversations.last_ai_message_at IS 'Timestamp of last AI message';
