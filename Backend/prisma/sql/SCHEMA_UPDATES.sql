-- ✅ Migration: add_year_and_wav_audio_format
-- Date: February 5, 2026
-- Migration ID: 20260204194725

-- Changes Applied:
-- 1. Added 'year' column to students table (Academic year 1-4)
-- 2. Removed 'audio_codec' column from student_submissions
-- 3. Updated audio format requirement to .wav at 16kHz

-- Students table now includes:
-- - year: Academic year (1-4) with default value of 1

-- Student Submissions audio format:
-- - Format: .wav (was opus)
-- - Frequency: 16kHz
-- - Storage: audio_path only (no codec field needed)

SELECT 
    'students' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

SELECT 
    'student_submissions' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'student_submissions'
ORDER BY ordinal_position;
