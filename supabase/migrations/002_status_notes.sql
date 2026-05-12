-- =====================================================
-- MIGRATION: Add watch_status + notes columns
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add watch_status column (stores the real 3-way status)
ALTER TABLE watchlist_items
  ADD COLUMN IF NOT EXISTS watch_status TEXT
    CHECK (watch_status IN ('watching', 'watched', 'want_to_watch'))
    DEFAULT 'want_to_watch';

-- 2. Backfill from the existing `watched` boolean so old rows are correct
UPDATE watchlist_items
  SET watch_status = CASE
    WHEN watched = true THEN 'watched'
    ELSE 'want_to_watch'
  END
  WHERE watch_status IS NULL OR watch_status = 'want_to_watch';

-- 3. Add notes column (user personal notes per item)
ALTER TABLE watchlist_items
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;

-- 4. Index for the new status column (used in watchlist filters)
CREATE INDEX IF NOT EXISTS idx_watchlist_watch_status
  ON watchlist_items(user_id, watch_status);