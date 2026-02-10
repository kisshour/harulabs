-- 1. Create a public bucket named 'products' if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts (optional but recommended for clean slate)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- 3. Create Policies

-- Allow anyone to view images (SELECT)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );

-- Allow authenticated users (logged in admin) to upload images (INSERT)
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'products' );

-- Allow authenticated users to update images
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'products' );

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'products' );

-- (Optional) If you are testing without login and still get errors, 
-- you can temporarily allow public INSERT (dangerous for production):
-- CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'products' );
