-- product_options 테이블에 가격 및 티어 컬럼 추가
ALTER TABLE product_options 
ADD COLUMN price NUMERIC, 
ADD COLUMN price_usd NUMERIC, 
ADD COLUMN price_thb NUMERIC,
ADD COLUMN tier TEXT;
