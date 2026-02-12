
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanDuplicate() {
    console.log('Cleaning duplicate: HYRGSV0001-SV0005...');

    // Delete options first
    const { error: optError } = await supabase
        .from('product_options')
        .delete()
        .eq('product_id', 'HYRGSV0001-SV0005');

    if (optError) console.error('Error deleting options:', optError);

    // Delete product
    const { error: prodError } = await supabase
        .from('products')
        .delete()
        .eq('id', 'HYRGSV0001-SV0005');

    if (prodError) {
        console.error('Error deleting product:', prodError);
    } else {
        console.log('Duplicate cleaned successfully.');
    }
}

cleanDuplicate();
