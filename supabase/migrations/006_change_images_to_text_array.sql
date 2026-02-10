-- Change the images column from JSONB to TEXT[]
-- This migration converts existing JSONB data to text array

-- First, add a temporary column
ALTER TABLE products ADD COLUMN IF NOT EXISTS images_temp TEXT[];

-- Convert existing JSONB data to text array (if any data exists)
UPDATE products
SET images_temp = ARRAY(SELECT jsonb_array_elements_text(images))
WHERE images IS NOT NULL AND images != '[]'::jsonb;

-- Set empty array for null or empty values
UPDATE products
SET images_temp = '{}'::TEXT[]
WHERE images_temp IS NULL;

-- Drop the old column and rename the new one
ALTER TABLE products DROP COLUMN images;
ALTER TABLE products RENAME COLUMN images_temp TO images;

-- Set default value and not null constraint
ALTER TABLE products ALTER COLUMN images SET DEFAULT '{}';
ALTER TABLE products ALTER COLUMN images SET NOT NULL;
