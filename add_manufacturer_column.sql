-- Add manufacturer column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS manufacturer text DEFAULT 'HOLIC'; 

-- Note: You might want to update existing rows if they don't have this value, 
-- but 'HOLIC' default is a safe start or NULL if you prefer.
-- For stricter data integrity:
-- UPDATE products SET manufacturer = 'HOLIC' WHERE manufacturer IS NULL;
