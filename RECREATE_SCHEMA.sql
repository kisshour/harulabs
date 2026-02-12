-- 1. DROP EXISTING (Just in case)
DROP TABLE IF EXISTS product_options;
DROP TABLE IF EXISTS products;

-- 2. CREATE PRODUCTS TABLE
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  theme TEXT,
  category TEXT,
  material TEXT,
  price NUMERIC DEFAULT 0,
  description TEXT,
  cost NUMERIC DEFAULT 0,
  price_usd NUMERIC DEFAULT 0,
  price_thb NUMERIC DEFAULT 0,
  tier TEXT,
  purchase_info TEXT,
  manufacturer TEXT DEFAULT 'HOLIC',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE PRODUCT_OPTIONS TABLE
CREATE TABLE product_options (
  sku TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  color TEXT,
  sub_color TEXT,
  size TEXT,
  stock INTEGER DEFAULT 999,
  cost NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  price_usd NUMERIC DEFAULT 0,
  price_thb NUMERIC DEFAULT 0,
  tier TEXT,
  theme TEXT,
  category TEXT,
  material TEXT,
  purchase_info TEXT,
  images JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;

-- Simple select policy for public access
CREATE POLICY "Allow public select on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public select on product_options" ON product_options FOR SELECT USING (true);

-- Admin policies (assuming authenticated users are admins)
CREATE POLICY "Allow all for authenticated users on products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users on product_options" ON product_options FOR ALL TO authenticated USING (true);
