
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ytksswtwclsybekiheig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log('--- DB CHECK START ---');

    const { data: products, error: prodError } = await supabase.from('products').select('id').limit(1);
    if (prodError) {
        console.log('TABLE [products]: MISSING or ERROR ->', prodError.message);
    } else {
        console.log('TABLE [products]: OK (Found)');
    }

    const { data: options, error: optError } = await supabase.from('product_options').select('sku').limit(1);
    if (optError) {
        console.log('TABLE [product_options]: MISSING or ERROR ->', optError.message);
    } else {
        console.log('TABLE [product_options]: OK (Found)');
    }

    console.log('--- DB CHECK END ---');
}

listTables();
