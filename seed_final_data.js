
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase Configuration (from .env.local)
const supabaseUrl = 'https://ytksswtwclsybekiheig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Constants (Matching the app logic) ---

const THEMES = { HYPE: 'HY', AURA: 'AU', RHYTHM: 'RH', URBAN: 'UR' };
const CATEGORIES = { RING: 'RG', NECKLACE: 'NK', EARRING: 'ER', BRACELET: 'BR' };
const MATERIALS = { SURGICAL_STEEL: 'SS', SILVER: 'SV', GOLD: 'GD', BRASS: 'BR' };
const MAIN_COLORS = { SILVER: 'SV', GOLD: 'GD', ROSE_GOLD: 'RG' };
const SUB_COLORS = { 'ETC': '00', 'CRYSTAL': '01', 'WHITE': '02', 'BLACK': '03', 'PINK': '05' };

const TIER_RANGES = [
    { name: 'Tier-UR1', min: 0, max: 2000, krw: 9900, usd: 6.99, thb: 199 },
    { name: 'Tier-UR2', min: 2001, max: 4000, krw: 14900, usd: 10.99, thb: 299 },
    { name: 'Tier-UR3', min: 4001, max: 5500, krw: 19900, usd: 14.99, thb: 399 },
    { name: 'Tier-UR4', min: 5501, max: 8000, krw: 24900, usd: 18.99, thb: 499 },
    { name: 'Tier-RH1', min: 16000, max: 19000, krw: 49000, usd: 34.99, thb: 999 },
];

const RING_SIZES = ['05', '06', '07', '08'];

// --- Helpers ---

const getRandomKey = (obj) => {
    const keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateSKU = (theme, category, material, index, mainColor, subColor, size) => {
    const themeCode = THEMES[theme] || 'XX';
    const categoryCode = CATEGORIES[category] || 'XX';
    const materialCode = MATERIALS[material] || 'XX';
    const indexCode = String(index).padStart(4, '0');
    const mainColorCode = MAIN_COLORS[mainColor] || 'XX';
    const subColorCode = SUB_COLORS[subColor] || '00';
    const sizeCode = String(size).toUpperCase();
    return `${themeCode}${categoryCode}${materialCode}${indexCode}-${mainColorCode}${subColorCode}${sizeCode}`;
};

const calculatePricing = (inputCost) => {
    const match = TIER_RANGES.find(t => inputCost >= t.min && inputCost <= t.max);
    if (match) {
        return { krw: match.krw, usd: match.usd, thb: match.thb, tier: match.name };
    }
    return { krw: inputCost * 3, usd: 0, thb: 0, tier: 'Custom' };
};

// --- Main Seeding Logic ---

async function seed() {
    console.log('--- Database Seeding Started ---');

    // 1. Upload Images to Storage
    console.log('Step 1: Uploading sample images to Supabase Storage...');
    const samplesPath = './src/assets/sample';
    const filenames = fs.readdirSync(samplesPath);
    const imageUrls = [];

    for (const filename of filenames) {
        const filePath = path.join(samplesPath, filename);
        const fileBuffer = fs.readFileSync(filePath);

        // Check if file already exists or just upload with a clean name
        const cleanName = `seeded-${Date.now()}-${filename.replace(/\s+/g, '_')}`;

        const { data, error } = await supabase.storage
            .from('products')
            .upload(cleanName, fileBuffer, { contentType: 'image/jpeg', upsert: true });

        if (error) {
            console.error(`Failed to upload ${filename}:`, error.message);
            continue;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(cleanName);

        imageUrls.push(publicUrl);
        process.stdout.write('.');
    }
    console.log(`\nUploaded ${imageUrls.length} images.`);

    // 2. Generate Products and Options
    console.log('Step 2: Generating 100 products and options...');
    const products = [];
    const options = [];

    for (let i = 1; i <= 100; i++) {
        const name = `TEST ${String(i).padStart(3, '0')}`;
        const theme = getRandomKey(THEMES);
        const category = getRandomKey(CATEGORIES);
        const material = getRandomKey(MATERIALS);
        const index = i;

        // Common product info (derived from first option eventually)
        const productCost = Math.floor(Math.random() * 6000) + 1000; // 1000 - 7000
        const pricing = calculatePricing(productCost);

        // 1-2 Random Options per product
        const numOptions = Math.floor(Math.random() * 2) + 1;
        const currentProductOptions = [];

        for (let j = 0; j < numOptions; j++) {
            const mainColor = getRandomKey(MAIN_COLORS);
            const subColor = getRandomKey(SUB_COLORS);
            const size = category === 'RING' ? getRandomItem(RING_SIZES) : 'FR';
            const sku = generateSKU(theme, category, material, index, mainColor, subColor, size);

            // 2-3 random images
            const numImgs = Math.floor(Math.random() * 2) + 2; // 2 or 3
            const selectedImages = [];
            for (let k = 0; k < numImgs; k++) {
                selectedImages.push(getRandomItem(imageUrls));
            }

            const opt = {
                product_id: '', // Will be set after SKU generation
                sku,
                color: mainColor,
                sub_color: subColor,
                size,
                stock: 999,
                cost: productCost,
                price: pricing.krw,
                price_usd: pricing.usd,
                price_thb: pricing.thb,
                tier: pricing.tier,
                images: selectedImages,
                theme,
                category,
                material
            };
            currentProductOptions.push(opt);
        }

        // Use the first option's SKU as the main product ID for consistency
        const mainId = currentProductOptions[0].sku;
        currentProductOptions.forEach(o => o.product_id = mainId);

        products.push({
            id: mainId,
            name,
            theme,
            category,
            material,
            price: pricing.krw,
            price_usd: pricing.usd,
            price_thb: pricing.thb,
            cost: productCost,
            description: `Seeded test product ${name}. A beautiful ${category.toLowerCase()} from the ${theme} collection.`,
            purchase_info: 'TEST DATA 2026',
            created_at: new Date().toISOString()
        });

        options.push(...currentProductOptions);
    }

    // 3. Batch Upsert to Supabase
    console.log('Step 3: Saving to Database...');

    // Delete existing TEST products first
    const { error: delErr } = await supabase.from('products').delete().ilike('name', 'TEST %');
    if (delErr) console.warn('Warning: Could not clear old TEST products:', delErr.message);

    // Chunking to avoid payload size limits
    const chunkSize = 20;

    for (let i = 0; i < products.length; i += chunkSize) {
        const chunk = products.slice(i, i + chunkSize);
        const { error } = await supabase.from('products').upsert(chunk);
        if (error) console.error('Product Upsert Error:', error.message);
    }
    console.log('Products saved.');

    for (let i = 0; i < options.length; i += chunkSize) {
        const chunk = options.slice(i, i + chunkSize);
        const { error } = await supabase.from('product_options').upsert(chunk);
        if (error) console.error('Options Upsert Error:', error.message);
    }
    console.log('Options saved.');

    console.log('--- Seeding Complete! ---');
}

seed();
