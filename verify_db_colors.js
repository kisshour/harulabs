
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyUpdate() {
    const { data, error } = await supabase
        .from('product_options')
        .select('color')
        .eq('color', 'ROSE_GOLD');

    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    console.log(`Remaining 'ROSE_GOLD' records: ${data.length}`);

    const { data: rosegold, error: err2 } = await supabase
        .from('product_options')
        .select('color')
        .eq('color', 'ROSEGOLD')
        .limit(5);

    if (rosegold) {
        console.log(`Sample 'ROSEGOLD' records found: ${rosegold.length}`);
    }
}

verifyUpdate();
