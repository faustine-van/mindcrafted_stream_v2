-- =====================================================
-- MINDCRAFTED STREAM DATABASE SCHEMA
-- Version: 2.0 with TMDB Integration
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: watchlist_items (Updated for TMDB)
-- =====================================================

CREATE TABLE IF NOT EXISTS watchlist_items (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User Reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- TMDB Identifiers
  tmdb_id TEXT,
  imdb_id TEXT,
  
  -- Content Information
  title TEXT NOT NULL,
  original_title TEXT,
  type TEXT CHECK (type IN ('movie', 'tv')) NOT NULL,
  genre TEXT,
  year TEXT,
  release_date DATE,
  
  -- Plot & Description
  plot TEXT,
  tagline TEXT,
  
  -- Images (Multiple sizes for responsive design)
  poster TEXT,
  poster_small TEXT,
  poster_large TEXT,
  backdrop TEXT,
  backdrop_small TEXT,
  
  -- Ratings & Popularity
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),  -- User's personal rating
  tmdb_rating DECIMAL(3,1),  -- TMDB community rating (0-10)
  vote_count INTEGER,
  popularity DECIMAL(10,3),
  
  -- Additional Details
  runtime INTEGER,  -- In minutes
  status TEXT, 
  original_language TEXT DEFAULT 'en',
  adult BOOLEAN DEFAULT false,
  
  -- User Interaction
  watched BOOLEAN DEFAULT false,
  favorite BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

DROP INDEX IF EXISTS idx_watchlist_user_id;
DROP INDEX IF EXISTS idx_watchlist_user_created;
DROP INDEX IF EXISTS idx_watchlist_watched;
DROP INDEX IF EXISTS idx_watchlist_favorite;
DROP INDEX IF EXISTS idx_watchlist_rating;
DROP INDEX IF EXISTS idx_watchlist_user_imdb;
DROP INDEX IF EXISTS idx_watchlist_tmdb_id;
DROP INDEX IF EXISTS idx_watchlist_tmdb_rating;
DROP INDEX IF EXISTS idx_watchlist_release_date;

CREATE INDEX idx_watchlist_user_id ON watchlist_items(user_id);
CREATE INDEX idx_watchlist_user_created ON watchlist_items(user_id, created_at DESC);
CREATE INDEX idx_watchlist_release_date ON watchlist_items(user_id, release_date DESC);
CREATE INDEX idx_watchlist_watched ON watchlist_items(user_id, watched);
CREATE INDEX idx_watchlist_favorite ON watchlist_items(user_id, favorite);
CREATE INDEX idx_watchlist_rating ON watchlist_items(user_id, rating DESC);
CREATE INDEX idx_watchlist_tmdb_rating ON watchlist_items(user_id, tmdb_rating DESC);
CREATE INDEX idx_watchlist_tmdb_id ON watchlist_items(user_id, tmdb_id);
CREATE INDEX idx_watchlist_imdb_id ON watchlist_items(user_id, imdb_id);
CREATE INDEX idx_watchlist_user_type_watched ON watchlist_items(user_id, type, watched);

-- Recommendations endpoint index
DROP INDEX IF EXISTS idx_watchlist_recommendations;
CREATE INDEX idx_watchlist_recommendations
  ON watchlist_items(user_id, favorite, watched, tmdb_id)
  WHERE tmdb_id IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own items" ON watchlist_items;
DROP POLICY IF EXISTS "Users can insert own items" ON watchlist_items;
DROP POLICY IF EXISTS "Users can update own items" ON watchlist_items;
DROP POLICY IF EXISTS "Users can delete own items" ON watchlist_items;

CREATE POLICY "Users can view own items"
  ON watchlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
  ON watchlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON watchlist_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON watchlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_watchlist_updated_at ON watchlist_items;

CREATE TRIGGER update_watchlist_updated_at
  BEFORE UPDATE ON watchlist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION SCRIPT (If upgrading from previous version)
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'tmdb_id') THEN
    ALTER TABLE watchlist_items ADD COLUMN tmdb_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'original_title') THEN
    ALTER TABLE watchlist_items ADD COLUMN original_title TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'release_date') THEN
    ALTER TABLE watchlist_items ADD COLUMN release_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'tagline') THEN
    ALTER TABLE watchlist_items ADD COLUMN tagline TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'poster_small') THEN
    ALTER TABLE watchlist_items ADD COLUMN poster_small TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'poster_large') THEN
    ALTER TABLE watchlist_items ADD COLUMN poster_large TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'backdrop') THEN
    ALTER TABLE watchlist_items ADD COLUMN backdrop TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'backdrop_small') THEN
    ALTER TABLE watchlist_items ADD COLUMN backdrop_small TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'tmdb_rating') THEN
    ALTER TABLE watchlist_items ADD COLUMN tmdb_rating DECIMAL(3,1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'vote_count') THEN
    ALTER TABLE watchlist_items ADD COLUMN vote_count INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'popularity') THEN
    ALTER TABLE watchlist_items ADD COLUMN popularity DECIMAL(10,3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'runtime') THEN
    ALTER TABLE watchlist_items ADD COLUMN runtime INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'status') THEN
    ALTER TABLE watchlist_items ADD COLUMN status TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'original_language') THEN
    ALTER TABLE watchlist_items ADD COLUMN original_language TEXT DEFAULT 'en';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist_items' AND column_name = 'adult') THEN
    ALTER TABLE watchlist_items ADD COLUMN adult BOOLEAN DEFAULT false;
  END IF;

  ALTER TABLE watchlist_items DROP CONSTRAINT IF EXISTS watchlist_items_type_check;
  ALTER TABLE watchlist_items ADD CONSTRAINT watchlist_items_type_check CHECK (type IN ('movie', 'tv'));
END $$;
