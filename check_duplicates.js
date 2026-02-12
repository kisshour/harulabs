
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDuplicates() {
    console.log('Checking for duplicates of TEST 001 RING...');
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', '%TEST 001%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${products.length} matching products:`);
    products.forEach(p => {
        console.log(`- ID: ${p.id}, Name: ${p.name}, Created: ${p.created_at}`);
    });

    if (products.length > 1) {
        console.log('\nDUPLICATES DETECTED!');
    } else {
        console.log('\nNo duplicates found for this name.');
    }
}

checkDuplicates();
