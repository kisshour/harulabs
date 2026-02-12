
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyImages() {
    const { data: options, error } = await supabase
        .from('product_options')
        .select('sku, images')
        .eq('category', 'RING')
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Verifying random ring options images:');
    options.forEach(opt => {
        console.log(`- ${opt.sku}: ${opt.images?.length || 0} images assigned.`);
        if (opt.images?.length > 0) {
            console.log(`  Sample: ${opt.images[0].substring(0, 50)}...`);
        }
    });
}

verifyImages();
