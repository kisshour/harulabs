
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyRings() {
    const { data: rings, error } = await supabase
        .from('products')
        .select('id, name, options:product_options(*)')
        .eq('category', 'RING');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Verifying ${rings.length} rings...`);
    rings.forEach(r => {
        const silverCount = r.options.filter(o => o.color === 'SILVER').length;
        const rosegoldCount = r.options.filter(o => o.color === 'ROSEGOLD').length;
        const total = r.options.length;
        const sizes = [...new Set(r.options.map(o => o.size))].sort();

        console.log(`- ${r.name}: Total ${total} options (SV: ${silverCount}, RG: ${rosegoldCount}). Sizes: [${sizes.join(', ')}]`);
    });
}

verifyRings();
