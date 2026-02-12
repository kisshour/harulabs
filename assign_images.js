
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ytksswtwclsybekiheig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a3Nzd3R3Y2xzeWJla2loZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTcwMDQsImV4cCI6MjA4NjIzMzAwNH0.jDdldJtkc8iee4XDo1yvDrFhheNqgt7W0n-cxjF36pM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function assignRandomImagesToRings() {
    console.log('Fetching available images from storage...');

    // 1. Get all images from 'products' bucket
    const { data: files, error: storageError } = await supabase.storage
        .from('products')
        .list('', { limit: 100 });

    if (storageError) {
        console.error('Error fetching storage:', storageError);
        return;
    }

    const imageUrls = files
        .filter(f => f.name.match(/\.(jpg|jpeg|png|webp)$/i))
        .map(f => {
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(f.name);
            return publicUrl;
        });

    if (imageUrls.length === 0) {
        console.error('No images found in storage!');
        return;
    }
    console.log(`Found ${imageUrls.length} images.`);

    // 2. Fetch all ring options
    console.log('Fetching ring options...');
    const { data: options, error: fetchError } = await supabase
        .from('product_options')
        .select('id, sku, color, size')
        .eq('category', 'RING');

    if (fetchError) {
        console.error('Error fetching options:', fetchError);
        return;
    }
    console.log(`Processing ${options.length} options.`);

    // 3. Update each option with 2-3 random images
    const getRandomItems = (arr, num) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    };

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const numImgs = Math.floor(Math.random() * 2) + 2; // 2 or 3
        const selectedImages = getRandomItems(imageUrls, numImgs);

        const { error: updateError } = await supabase
            .from('product_options')
            .update({ images: selectedImages })
            .eq('id', option.id);

        if (updateError) {
            console.error(`Error updating option ${option.sku}:`, updateError);
        }

        if ((i + 1) % 10 === 0) {
            console.log(`Updated ${i + 1}/${options.length} options...`);
        }
    }

    console.log('Image assignment complete.');
}

assignRandomImagesToRings();
