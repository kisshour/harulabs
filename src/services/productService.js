
import { supabase } from '../utils/supabaseClient';

// Fetch all products with their options
export const fetchProducts = async () => {
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            options:product_options(*)
        `); // Join with options table

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    // Format data to match our app's structure
    return products.map(p => ({
        ...p,
        options: p.options || []
    }));
};

// Fetch single product by ID (or SKU)
export const fetchProductById = async (id) => {
    // 1. Try finding by Main Product ID
    let { data: product, error } = await supabase
        .from('products')
        .select(`*, options:product_options(*)`)
        .eq('id', id)
        .single();

    if (product) return { ...product, options: product.options || [] };

    // 2. If not found, try finding by Option SKU
    // Logic: Find the option first to get product_id
    const { data: option } = await supabase
        .from('product_options')
        .select('product_id')
        .eq('sku', id)
        .single();

    if (option) {
        ({ data: product, error } = await supabase
            .from('products')
            .select(`*, options:product_options(*)`)
            .eq('id', option.product_id)
            .single());

        if (product) return { ...product, options: product.options || [] };
    }

    return null;
};


// Create or Update Product
export const upsertProduct = async (productData) => {
    // 1. Upsert Product Info
    const { id, name, theme, category, price, description, material, cost, price_usd } = productData;
    const { error: productError } = await supabase
        .from('products')
        .upsert({ id, name, theme, category, price, description, material, cost, price_usd });

    if (productError) throw productError;

    // 2. Upsert Options (Delete existing for this product and re-insert is easiest for synchronization, 
    // or upsert if we want to keep history. Let's delete & re-insert for simplicity in this version)

    // First, delete old options to handle removals
    await supabase.from('product_options').delete().eq('product_id', id);

    // Insert new options
    const optionsToInsert = productData.options.map(opt => ({
        product_id: id,
        sku: opt.sku,
        color: opt.color,
        size: opt.size,
        stock: opt.stock,
        images: opt.images
    }));

    const { error: optionsError } = await supabase
        .from('product_options')
        .insert(optionsToInsert);

    if (optionsError) throw optionsError;

    return true;
};

// Upload Image to Storage
export const uploadImage = async (file) => {
    // 1. Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. Upload
    const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading image:', error);
        throw error;
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

    return publicUrl;
};
