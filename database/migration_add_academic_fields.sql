-- Migration script to add new fields to academics table
-- Run this if you have an existing database

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Add title column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='academics' AND column_name='title') THEN
        ALTER TABLE academics ADD COLUMN title VARCHAR;
    END IF;

    -- Add theme column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='academics' AND column_name='theme') THEN
        ALTER TABLE academics ADD COLUMN theme TEXT;
    END IF;

    -- Add description column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='academics' AND column_name='description') THEN
        ALTER TABLE academics ADD COLUMN description TEXT;
    END IF;

    -- Add website column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='academics' AND column_name='website') THEN
        ALTER TABLE academics ADD COLUMN website VARCHAR;
    END IF;
END $$;

-- Verify the migration
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'academics' 
ORDER BY ordinal_position;
