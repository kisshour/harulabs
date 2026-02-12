
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyNames() {
    const { data: products, error } = await supabase
        .from('products')
        .select('name, category')
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Verifying standardized product names:');
    products.forEach(p => {
        console.log(`- ${p.name} (Category: ${p.category})`);
    });
}

verifyNames();
