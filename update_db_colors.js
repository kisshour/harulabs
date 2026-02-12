
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateColors() {
    console.log('--- Starting Color Option Update: ROSE_GOLD -> ROSEGOLD ---');

    // 1. Fetch options with ROSE_GOLD color
    const { data: options, error: fetchError } = await supabase
        .from('product_options')
        .select('*')
        .eq('color', 'ROSE_GOLD');

    if (fetchError) {
        console.error('Error fetching data:', fetchError);
        return;
    }

    console.log(`Found ${options.length} options with 'ROSE_GOLD'`);

    if (options.length === 0) {
        console.log('No records to update.');
        return;
    }

    // 2. Update color names
    const { data: updateData, error: updateError } = await supabase
        .from('product_options')
        .update({ color: 'ROSEGOLD' })
        .eq('color', 'ROSE_GOLD');

    if (updateError) {
        console.error('Error updating records:', updateError);
    } else {
        console.log('Successfully updated all ROSE_GOLD to ROSEGOLD.');
    }

    console.log('--- Update Complete ---');
}

updateColors();
