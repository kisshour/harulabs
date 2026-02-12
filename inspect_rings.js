
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectRings() {
    const { data: rings, error } = await supabase
        .from('products')
        .select('id, name, theme, category, material, options:product_options(*)')
        .eq('category', 'RING');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${rings.length} rings.`);
    rings.forEach(r => {
        const subColors = [...new Set(r.options.map(o => o.sub_color))];
        const sizes = [...new Set(r.options.map(o => o.size))];
        const mainColors = [...new Set(r.options.map(o => o.color))];
        console.log(`- ${r.name} (${r.id}): Main Colors: [${mainColors.join(',')}], Sub: [${subColors.join(',')}], Sizes: [${sizes.join(',')}]`);
    });
}

inspectRings();
