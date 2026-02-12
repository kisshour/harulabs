
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MAIN_COLORS = { SILVER: 'SV', ROSEGOLD: 'RG' };
const SIZES = ['05', '06', '07', '08'];

async function resetRingOptions() {
    console.log('Starting Ring Options Reset & Standardization...');

    // 1. Fetch all Ring products
    const { data: rings, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'RING');

    if (fetchError) {
        console.error('Error fetching rings:', fetchError);
        return;
    }

    const ringIds = rings.map(r => r.id);
    console.log(`Found ${ringIds.length} rings to process.`);

    // 2. Delete existing options for these rings
    const { error: deleteError } = await supabase
        .from('product_options')
        .delete()
        .in('product_id', ringIds);

    if (deleteError) {
        console.error('Error deleting existing options:', deleteError);
        return;
    }
    console.log('Existing options deleted.');

    // 3. Generate new standardized options
    const newOptions = [];
    rings.forEach(ring => {
        // Extract base ID part (before the hyphen if any)
        const baseId = ring.id.split('-')[0];

        Object.keys(MAIN_COLORS).forEach(color => {
            const colorCode = MAIN_COLORS[color];

            SIZES.forEach(size => {
                // SKU Rule: [BASE_ID]-[COLOR_CODE][SUB_CODE][SIZE]
                // Sub code is '00' for ETC
                const sku = `${baseId}-${colorCode}00${size}`;

                newOptions.push({
                    product_id: ring.id,
                    sku: sku,
                    color: color,
                    sub_color: 'ETC',
                    size: size,
                    price: ring.price || 0,
                    cost: ring.cost || 0,
                    price_usd: ring.price_usd || 0,
                    price_thb: ring.price_thb || 0,
                    tier: ring.tier || 'UR1', // Default tier
                    stock: 999, // Sufficient stock
                    theme: ring.theme,
                    category: ring.category,
                    material: ring.material
                });
            });
        });
    });

    console.log(`Generated ${newOptions.length} new standard options.`);

    // 4. Batch insert
    const batchSize = 100;
    for (let i = 0; i < newOptions.length; i += batchSize) {
        const batch = newOptions.slice(i, i + batchSize);
        const { error: insertError } = await supabase
            .from('product_options')
            .insert(batch);

        if (insertError) {
            console.error(`Error inserting batch ${i / batchSize}:`, insertError);
        } else {
            console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
        }
    }

    console.log('Standardization complete.');
}

resetRingOptions();
