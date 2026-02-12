
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateProductNames() {
    console.log('Starting Product Naming Standardization...');

    // 1. Fetch all products
    const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, name, category');

    if (fetchError) {
        console.error('Error fetching products:', fetchError);
        return;
    }

    console.log(`Processing ${products.length} products.`);

    let updatedCount = 0;

    for (const product of products) {
        const category = product.category || '';
        // Check if name already contains the category (case-insensitive)
        if (!product.name.toUpperCase().endsWith(category.toUpperCase())) {
            const newName = `${product.name} ${category}`;

            const { error: updateError } = await supabase
                .from('products')
                .update({ name: newName })
                .eq('id', product.id);

            if (updateError) {
                console.error(`Error updating product ${product.id}:`, updateError);
            } else {
                updatedCount++;
            }
        }
    }

    console.log(`Standardization complete. Updated ${updatedCount} product names.`);
}

updateProductNames();
