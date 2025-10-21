-- Migration 003: Tag-First Architecture + Maps URLs
-- Adds normalized tag tables and Google Maps links

BEGIN;

-- Add maps_url to venues
ALTER TABLE venues ADD COLUMN IF NOT EXISTS maps_url TEXT;

-- Add maps_url to activities (for area anchors)
ALTER TABLE activities ADD COLUMN IF NOT EXISTS maps_url TEXT;

-- Create normalized activity_tags table
CREATE TABLE IF NOT EXISTS activity_tags (
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  facet TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (activity_id, facet, value)
);

-- Create normalized venue_tags table
CREATE TABLE IF NOT EXISTS venue_tags (
  venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  facet TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (venue_id, facet, value)
);

-- Indexes for fast tag filtering
CREATE INDEX IF NOT EXISTS idx_activity_tags_facet_value ON activity_tags(facet, value);
CREATE INDEX IF NOT EXISTS idx_activity_tags_activity_id ON activity_tags(activity_id);
CREATE INDEX IF NOT EXISTS idx_venue_tags_facet_value ON venue_tags(facet, value);
CREATE INDEX IF NOT EXISTS idx_venue_tags_venue_id ON venue_tags(venue_id);

-- Function to rebuild denormalized tags array from normalized table
CREATE OR REPLACE FUNCTION rebuild_activity_tags(p_activity_id INT)
RETURNS VOID AS $$
BEGIN
  UPDATE activities
  SET tags = ARRAY(
    SELECT facet || ':' || value
    FROM activity_tags
    WHERE activity_id = p_activity_id
    ORDER BY facet, value
  )
  WHERE id = p_activity_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rebuild_venue_tags(p_venue_id INT)
RETURNS VOID AS $$
BEGIN
  UPDATE venues
  SET tags = ARRAY(
    SELECT facet || ':' || value
    FROM venue_tags
    WHERE venue_id = p_venue_id
    ORDER BY facet, value
  )
  WHERE id = p_venue_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-sync denormalized array on insert/update/delete
CREATE OR REPLACE FUNCTION sync_activity_tags()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM rebuild_activity_tags(OLD.activity_id);
    RETURN OLD;
  ELSE
    PERFORM rebuild_activity_tags(NEW.activity_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_venue_tags()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM rebuild_venue_tags(OLD.venue_id);
    RETURN OLD;
  ELSE
    PERFORM rebuild_venue_tags(NEW.venue_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS activity_tags_sync ON activity_tags;
CREATE TRIGGER activity_tags_sync
  AFTER INSERT OR UPDATE OR DELETE ON activity_tags
  FOR EACH ROW EXECUTE FUNCTION sync_activity_tags();

DROP TRIGGER IF EXISTS venue_tags_sync ON venue_tags;
CREATE TRIGGER venue_tags_sync
  AFTER INSERT OR UPDATE OR DELETE ON venue_tags
  FOR EACH ROW EXECUTE FUNCTION sync_venue_tags();

COMMIT;
