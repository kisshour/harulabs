
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ytksswtwclsybekiheig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM';

const supabase = createClient(supabaseUrl, supabaseKey);

const COLLECTIONS = ['HYPE', 'AURA', 'RHYTHM', 'URBAN'];
const CATEGORIES = ['RING', 'NECKLACE', 'EARRING', 'BRACELET'];
const MATERIALS = ['Surgical Steel', 'Silver 925', 'Brass', 'Titanium'];
const COLORS = ['Silver', 'Gold', 'Rose Gold', 'Black'];
const SUB_COLORS = ['Glossy', 'Matte', 'Vintage'];
const SIZES = ['S', 'M', 'L', 'Free'];

const TIER_RANGES = [
    { name: 'Tier-UR1', min: 0, max: 2000, krw: 9900, usd: 6.99, thb: 199 },
    { name: 'Tier-UR2', min: 2001, max: 4000, krw: 14900, usd: 10.99, thb: 299 },
    { name: 'Tier-UR3', min: 4001, max: 5500, krw: 19900, usd: 14.99, thb: 399 },
    { name: 'Tier-UR4', min: 5501, max: 8000, krw: 24900, usd: 18.99, thb: 499 },
    { name: 'Tier-RH1', min: 16000, max: 19000, krw: 49000, usd: 34.99, thb: 999 },
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPriceByCost = (cost) => {
    const match = TIER_RANGES.find(t => cost >= t.min && cost <= t.max);
    if (match) {
        return {
            krw: match.krw,
            usd: match.usd,
            thb: match.thb,
            tier: match.name
        };
    }
    // Fallback if cost out of range
    return {
        krw: cost * 3,
        usd: Math.floor(cost * 3 / 1300),
        thb: Math.floor(cost * 3 / 40),
        tier: 'Tier-Custom'
    };
};

async function seedProducts() {
    console.log('Starting seed process for TEST001 - TEST100...');

    const products = [];
    const options = [];

    for (let i = 1; i <= 100; i++) {
        const id = `TEST${String(i).padStart(3, '0')}`;
        const theme = getRandomItem(COLLECTIONS);
        const category = getRandomItem(CATEGORIES);
        const material = getRandomItem(MATERIALS);
        const name = `${theme} ${category} ${String(i).padStart(3, '0')}`;

        // Create 1-3 random options per product
        const numOptions = Math.floor(Math.random() * 3) + 1;
        const productOptions = [];

        for (let j = 0; j < numOptions; j++) {
            const color = getRandomItem(COLORS);
            const subColor = getRandomItem(SUB_COLORS);
            const size = getRandomItem(SIZES);
            const uniqueSku = `${id}-${j + 1}`;

            // Pick a random cost from our tier ranges to ensure we get valid tiers
            const randomTierRef = getRandomItem(TIER_RANGES);
            const randomCost = Math.floor(Math.random() * (randomTierRef.max - randomTierRef.min + 1) + randomTierRef.min);
            const pricing = getRandomPriceByCost(randomCost);

            productOptions.push({
                product_id: id,
                sku: uniqueSku,
                color,
                sub_color: subColor,
                size,
                stock: Math.floor(Math.random() * 50) + 10,
                cost: randomCost,
                price: pricing.krw,
                price_usd: pricing.usd,
                price_thb: pricing.thb,
                tier: pricing.tier,
                theme,
                category,
                material,
                purchase_info: '2026-02-13 Seeded',
                images: [] // No images for now, user can add later
            });
        }

        const minPrice = Math.min(...productOptions.map(o => o.price));
        const minPriceUsd = Math.min(...productOptions.map(o => o.price_usd));
        const minPriceThb = Math.min(...productOptions.map(o => o.price_thb));

        products.push({
            id,
            name,
            theme,
            category,
            material,
            price: minPrice,
            price_usd: minPriceUsd,
            price_thb: minPriceThb,
            description: `This is a test product description for ${name}.`,
            purchase_info: 'Start of 2026 Season Seeded',
            manufacturer: 'TEST_MAKER',
            created_at: new Date().toISOString()
        });

        options.push(...productOptions);
    }

    console.log(`Generated ${products.length} products and ${options.length} options.`);

    // UPSERT Products
    const { error: prodError } = await supabase.from('products').upsert(products);
    if (prodError) {
        console.error('Error inserting products:', prodError.message);
        return;
    }
    console.log('Products inserted successfully.');

    // CHUNK Options (Max 50 at a time for safety)
    const chunkSize = 50;
    for (let i = 0; i < options.length; i += chunkSize) {
        const chunk = options.slice(i, i + chunkSize);
        const { error: optError } = await supabase.from('product_options').upsert(chunk);
        if (optError) {
            console.error(`Error inserting options chunk ${i}:`, optError.message);
        } else {
            console.log(`Options chunk ${i} inserted.`);
        }
    }

    console.log('Seeding complete!');
    console.log(`Summary: Created 100 products (TEST001-TEST100) with ${options.length} variations.`);
}

seedProducts();
