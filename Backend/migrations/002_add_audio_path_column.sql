-- Migration: Add audio_path column and convert to file-based storage
-- Date: 2026-01-28
-- Description: Replaces BYTEA audio storage with file path to sounds/ folder

-- Add audio_path column for file-based storage
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'attempt_answers' 
        AND column_name = 'audio_path'
    ) THEN
        ALTER TABLE attempt_answers ADD COLUMN audio_path VARCHAR(255);
        RAISE NOTICE 'Column audio_path added to attempt_answers table';
    ELSE
        RAISE NOTICE 'Column audio_path already exists in attempt_answers table';
    END IF;
END $$;

-- Optional: Drop the audio BYTEA column if you want to fully migrate
-- UNCOMMENT the lines below after ensuring all data is migrated:
-- ALTER TABLE attempt_answers DROP COLUMN IF EXISTS audio;
-- RAISE NOTICE 'BYTEA audio column removed';

-- Display migration status
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully';
    RAISE NOTICE 'Audio will now be stored as .wav files (16kHz) in sounds/ folder';
    RAISE NOTICE 'File paths will be stored in audio_path column';
END $$;
