
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const THEMES = { HYPE: 'HY', AURA: 'AU', RHYTHM: 'RH', URBAN: 'UR' };
const CATEGORIES = { RING: 'RG', NECKLACE: 'NK', EARRING: 'ER', BRACELET: 'BR', ETC: 'ET' };
const MATERIALS = { SURGICAL_STEEL: 'SS', SILVER: 'SV', GOLD: 'GD', BRASS: 'BR', OTHER: 'OT' };
const MAIN_COLORS = { SILVER: 'SV', GOLD: 'GD', ROSEGOLD: 'RG', ETC: 'ET' };

async function updateRingOptions() {
    console.log('Starting Ring Options Expansion (05-08)...');

    // 1. Fetch all Ring products and their current options
    const { data: rings, error } = await supabase
        .from('products')
        .select('id, name, theme, category, material, options:product_options(*)')
        .eq('category', 'RING');

    if (error) {
        console.error('Error fetching rings:', error);
        return;
    }

    const newOptions = [];
    const targetSubColors = ['05', '06', '07', '08'];

    rings.forEach(ring => {
        // Find existing (Color, Size) combinations
        const existingCombinations = [];
        ring.options.forEach(opt => {
            const key = `${opt.color}-${opt.size}`;
            if (!existingCombinations.includes(key)) {
                existingCombinations.push(key);
            }
        });

        // For each combination, check if 05-08 sub_colors exist
        existingCombinations.forEach(combo => {
            const [color, size] = combo.split('-');

            targetSubColors.forEach(sub => {
                const alreadyExists = ring.options.find(opt => opt.color === color && opt.size === size && opt.sub_color === sub);

                if (!alreadyExists) {
                    // Create new option template based on the first option of this product
                    const baseOpt = ring.options[0];

                    // Generate new SKU
                    // Product ID: HYRGSS0001
                    const idParts = ring.id.split('-');
                    const baseId = idParts[0]; // e.g., HYRGSS0001
                    const mainColorCode = MAIN_COLORS[color] || 'SV';
                    const newSku = `${baseId}-${mainColorCode}${sub}${size.toUpperCase()}`;

                    newOptions.push({
                        product_id: ring.id,
                        sku: newSku,
                        color: color,
                        sub_color: sub,
                        size: size,
                        price: baseOpt.price,
                        cost: baseOpt.cost,
                        price_usd: baseOpt.price_usd,
                        price_thb: baseOpt.price_thb,
                        tier: baseOpt.tier,
                        stock: 100, // Default stock
                        theme: ring.theme,
                        category: ring.category,
                        material: ring.material
                    });
                }
            });
        });
    });

    console.log(`Prepared ${newOptions.length} new options to insert.`);

    if (newOptions.length > 0) {
        // Insert in batches of 100 to avoid limits
        const batchSize = 100;
        for (let i = 0; i < newOptions.length; i += batchSize) {
            const batch = newOptions.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('product_options')
                .insert(batch);

            if (insertError) {
                console.error(`Error inserting batch ${i / batchSize}:`, insertError);
            } else {
                console.log(`Inserted batch ${i / batchSize + 1}`);
            }
        }
    }

    console.log('Update complete.');
}

updateRingOptions();
