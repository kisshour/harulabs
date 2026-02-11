-- product_options 테이블에 스펙 관련 컬럼 추가
ALTER TABLE product_options 
ADD COLUMN theme TEXT,
ADD COLUMN category TEXT,
ADD COLUMN material TEXT,
ADD COLUMN purchase_info TEXT;
