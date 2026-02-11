
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ytksswtwclsybekiheig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    console.log('Fetching all products...');
    const { data: products, error } = await supabase
        .from('products')
        .select('id, theme, category, material, name')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${products.length} products.`);
    products.forEach(p => {
        console.log(`ID: [${p.id}] | Theme: ${p.theme} | Cat: ${p.category} | Mat: ${p.material} | Name: ${p.name}`);
    });
}

checkProducts();
