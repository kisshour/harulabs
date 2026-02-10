
import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { generateSKU, THEMES, CATEGORIES, MATERIALS, MANUFACTURERS, COLORS } from '../utils/skuGenerator';
import { supabase } from '../utils/supabaseClient';
import { fetchProducts, uploadImage } from '../services/productService';
import { useNavigate } from 'react-router-dom';

const TIER_RANGES = [
    { name: 'Tier-UR1', min: 1000, max: 2000, krw: 9900, usd: 6.99, thb: 199 },
    { name: 'Tier-UR2', min: 2500, max: 4000, krw: 14900, usd: 10.99, thb: 299 },
    { name: 'Tier-UR3', min: 4500, max: 6500, krw: 24900, usd: 18.99, thb: 499 },
    { name: 'Tier-RH1', min: 16000, max: 19000, krw: 49000, usd: 34.99, thb: 999 },
];

const Admin = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'form'
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null); // Track original ID for editing/deleting
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Form State
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('HYPE');
    const [category, setCategory] = useState('RING');
    const [material, setMaterial] = useState('SURGICAL_STEEL');
    const [manufacturer, setManufacturer] = useState('HOLIC');
    const [index, setIndex] = useState(1);
    const [price, setPrice] = useState(0);
    const [cost, setCost] = useState(0); // Wholesale Cost
    const [priceUsd, setPriceUsd] = useState(0); // USD Price
    const [priceTHB, setPriceTHB] = useState(0); // THB Price
    const [tier, setTier] = useState(''); // Tier (e.g., 'Tier 1')
    const [description, setDescription] = useState('');
    const [dragActiveIndex, setDragActiveIndex] = useState(null);
    const [commonImages, setCommonImages] = useState([]); // Shared images for all options

    // Pricing Logic
    const handleCostChange = (e) => {
        const newCost = Number(e.target.value);
        setCost(newCost);

        // Find matching price tier
        // Strategy: Find exact match or the next higher tier if not exact? 
        // Or just closest? The user image implies strict tiers.
        // Let's implement exact match or fallback to a formula if not found.
        // Actually, let's just find the entry where cost <= table_cost to recommend, 
        // or just strict match based on the provided table.

        // Let's try to find an exact match first.
        const match = TIER_RANGES.find(t => newCost >= t.min && newCost <= t.max);

        if (match) {
            setPrice(match.krw);
            setPriceUsd(match.usd);
            setPriceTHB(match.thb);
            setTier(match.name);

            // Auto-select Theme based on Tier
            if (match.name.startsWith('Tier-UR')) {
                setTheme('URBAN');
            } else if (match.name.startsWith('Tier-RH')) {
                setTheme('RHYTHM');
            }
        } else {
            // Optional: reset or keep manual?
            setTier('');
        }
    };

    // Options State (Starting with one default option)
    const [options, setOptions] = useState([
        { color: 'SILVER', size: 'FR', stock: 10, imageNames: [] }
    ]);

    // Fetch Products on Load
    useEffect(() => {
        fetchProductsFromDB();
    }, []);

    const fetchProductsFromDB = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                options:product_options(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            setMessage('Error loading products.');
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    // Save Logic (Create or Update)
    const handleSave = async () => {
        setLoading(true);
        setMessage('Saving...');

        // 1. Construct Main Product ID
        const mainId = generateSKU(theme, category, material, manufacturer, index, options[0]?.color || 'XX', options[0]?.size || 'XX');

        // 2. Prepare Data
        const productData = {
            id: mainId,
            name,
            theme,
            category,
            price: Number(price), // KRW Retail
            cost: Number(cost), // Wholesale Cost
            price_usd: Number(priceUsd), // USD Retail
            price_thb: Number(priceTHB), // THB Retail
            description,
            material,
            manufacturer
        };

        // Check for duplicates if creating new
        if (!isEditing) {
            const exists = products.some(p => p.id === mainId);
            if (exists) {
                setMessage(`Error: Product ID ${mainId} already exists! Please increase Index Number.`);
                setLoading(false);
                return;
            }
        }

        // 3. Save Product
        let result;
        if (isEditing) {
            result = await supabase.from('products').upsert(productData);
        } else {
            // Use insert to prevent accidental overwrite if client-side check missed something
            result = await supabase.from('products').insert(productData);
        }
        const { error: productError } = result;

        if (productError) {
            console.error('Error saving product:', productError);
            if (productError.code === '23505') { // Unique violation
                setMessage(`Error: Product ID ${mainId} already exists!`);
            } else {
                setMessage(`Error: ${productError.message}`);
            }
            setLoading(false);
            return;
        }

        // 4. Handle Options (Delete old ones first for simplicity, then insert new)
        // First delete existing options for this product
        await supabase.from('product_options').delete().eq('product_id', mainId);

        // Prepare Options Data
        // Merge specific images with common images (Specific First + Common Last)
        const optionsData = options.map(opt => {
            // If option has specific images, use them. 
            // Then append common images.
            // If option has NO specific images, it will just be common images.
            // AND ensure no duplicates if someone uploads same image to both? (Unlikely workflow but possible)
            // For now, simple concatenation as requested: "Specific then Common".

            const combinedImages = [...(opt.imageNames || []), ...commonImages];

            // Remove duplicates just in case?
            // const uniqueImages = [...new Set(combinedImages)]; 
            // User might want specific ordering, so simple concat is safer for "Specific then Common".

            return {
                product_id: mainId,
                sku: generateSKU(theme, category, material, manufacturer, index, opt.color, opt.size),
                color: opt.color,
                size: opt.size,
                stock: Number(opt.stock),
                images: combinedImages
            };
        });

        const { error: optionsError } = await supabase
            .from('product_options')
            .insert(optionsData);

        if (optionsError) {
            console.error('Error saving options:', optionsError);
            setMessage('Product saved, but options failed.');
        } else {
            setMessage('Product saved successfully!');
            fetchProductsFromDB(); // Refresh dashboard
            setTimeout(() => {
                setView('dashboard');
                setMessage('');
            }, 1000);
        }
        setLoading(false);
    };



    const handleDelete = async () => {
        // Use the ID from the product object if available (original ID), 
        // otherwise fall back to mainId but that might be dangerous if form changed.
        // We need to store original ID when entering edit mode.
        // But for now, let's assume we want to delete the product currently being edited *as it was loaded*.
        // However, we don't have 'originalId' in state. 
        // Let's modify handleEditClick to store it or just trust the user hasn't changed key fields? 
        // No, user said "Delete Success" so no error, meaning ID likely didn't match.

        // Let's find the product in the list that matches the current state? No.
        // We should add a state for `editingId`.

        const targetId = editingId || mainId;

        if (!window.confirm(`Are you sure you want to delete product: ${targetId}?`)) {
            return;
        }

        setLoading(true);
        setMessage('Deleting product...');

        // 1. Delete linked options
        const { error: optionsError } = await supabase
            .from('product_options')
            .delete()
            .eq('product_id', targetId);

        if (optionsError) {
            console.error('Error deleting options:', optionsError);
            setMessage(`Error deleting options: ${optionsError.message}`);
            setLoading(false);
            return;
        }

        // 2. Delete the product
        const { error, count } = await supabase
            .from('products')
            .delete({ count: 'exact' }) // Request count
            .eq('id', targetId);

        if (error) {
            console.error('Error deleting product:', error);
            setMessage(`Error: ${error.message}`);
        } else {
            // Check if any row was actually deleted
            // note: supabase js v2 returns count in 'count' property if requested, or inside data? 
            // It seems 'count' property is available if { count: 'exact' } is passed.
            // Let's rely on alerting the user if count is 0.

            if (count === 0) {
                setMessage(`No product found with ID: ${targetId}`);
            } else {
                setMessage('Product deleted successfully!');
                await fetchProductsFromDB();
                setTimeout(() => {
                    setView('dashboard');
                    setMessage('');
                }, 1000);
            }
        }
        setLoading(false);
    };


    // Handlers
    // Handlers
    // Drag and Drop Handlers
    const handleDrag = (e, idx) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActiveIndex(idx);
        } else if (e.type === 'dragleave') {
            setDragActiveIndex(null);
        }
    };

    const handleDrop = (e, idx) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActiveIndex(null);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (idx === 'common') {
                handleCommonImageUpload(e.dataTransfer.files);
            } else {
                handleImageUpload(idx, e.dataTransfer.files);
            }
        }
    };

    const handleOptionChange = (idx, field, value) => {
        const newOptions = [...options];
        newOptions[idx][field] = value;
        setOptions(newOptions);
    };

    const handleImageUpload = async (idx, files) => {
        if (!files || files.length === 0) return;
        setLoading(true);
        setMessage('Uploading images... Please wait.');

        try {
            const uploadedUrls = [];
            // Upload specific files in parallel
            const uploadPromises = Array.from(files).map(file => uploadImage(file));
            const results = await Promise.all(uploadPromises);

            uploadedUrls.push(...results);
            console.log('Uploads successful:', uploadedUrls);

            // Append new images to existing list
            const newOptions = [...options];
            newOptions[idx].imageNames = [...(newOptions[idx].imageNames || []), ...uploadedUrls];
            setOptions(newOptions);

            setMessage('Images uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            setMessage(`Image upload failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCommonImageUpload = async (files) => {
        if (!files || files.length === 0) return;
        setLoading(true);
        setMessage('Uploading common images... Please wait.');

        try {
            const uploadedUrls = [];
            const uploadPromises = Array.from(files).map(file => uploadImage(file));
            const results = await Promise.all(uploadPromises);

            uploadedUrls.push(...results);
            setCommonImages([...commonImages, ...uploadedUrls]);
            setMessage('Common images uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            setMessage(`Common image upload failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const removeCommonImage = (imgIdx) => {
        setCommonImages(commonImages.filter((_, i) => i !== imgIdx));
    };

    const removeImage = (optIdx, imgIdx) => {
        const newOptions = [...options];
        newOptions[optIdx].imageNames = newOptions[optIdx].imageNames.filter((_, i) => i !== imgIdx);
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, { color: 'SILVER', size: 'FR', stock: 10, imageName: '' }]);
    };

    const removeOption = (idx) => {
        if (options.length > 1) {
            const newOptions = options.filter((_, i) => i !== idx);
            setOptions(newOptions);
        }
    };

    // Get next available index when parameters change
    useEffect(() => {
        if (!isEditing && view === 'form') {
            fetchNextIndex();
        }
    }, [theme, category, material, manufacturer, isEditing, view]);

    const fetchNextIndex = async () => {
        // Find existing products with same prefix to determine max index
        const prefix = `${THEMES[theme]}${CATEGORIES[category]}${MATERIALS[material]}${MANUFACTURERS[manufacturer]}`;
        // Query database for IDs starting with this prefix
        // Since we can't do complex regex easily on client side without fetching all, 
        // let's just fetch all and filter client side for now as dataset is small, 
        // or rely on 'products' state if it contains all.
        // Better: Use products state which is already loaded.

        let maxIdx = 0;
        products.forEach(p => {
            // ID format: PREFIX(including index)-OPTIONS...
            // e.g. HYRGSSHL0001-SVFR
            if (p.id.startsWith(prefix)) {
                const parts = p.id.split('-');
                if (parts[0]) {
                    // Extract index part (last 4 chars of first part)
                    const idxStr = parts[0].slice(-4);
                    const idx = parseInt(idxStr, 10);
                    if (!isNaN(idx) && idx > maxIdx) {
                        maxIdx = idx;
                    }
                }
            }
        });
        setIndex(maxIdx + 1);
    };

    // Initialize Form for Creation
    const handleCreateClick = () => {
        console.log('Create clicked');
        try {
            setIsEditing(false);
            setEditingId(null);
            setName('');
            setTheme('HYPE');
            setCategory('RING');
            setMaterial('SURGICAL_STEEL');
            setManufacturer('HOLIC');
            // Index will be set by useEffect
            setPrice(0);
            setCost(0);
            setPriceUsd(0);
            setPriceTHB(0);
            setTier('');
            setDescription('');
            setOptions([{ color: 'SILVER', size: 'FR', stock: 10, imageNames: [] }]);
            setCommonImages([]); // Reset common images
            setMessage('');
            setView('form');
            console.log('View set to form');
        } catch (error) {
            console.error('Error in handleCreateClick:', error);
            setMessage('Error identifying create action.');
        }
    };

    // Initialize Form for Editing
    const handleEditClick = (product) => {
        setIsEditing(true);
        setEditingId(product.id); // Store original ID
        setName(product.name);
        setTheme(product.theme);
        setCategory(product.category);
        setMaterial(product.material);
        setManufacturer(product.manufacturer || 'HOLIC'); // Load manufacturer, default to HOLIC if missing
        setPrice(product.price);
        setCost(product.cost || 0); // Load cost
        setPriceUsd(product.price_usd || 0); // Load USD price
        setPriceTHB(product.price_thb || 0); // Load THB
        setTier(product.tier || ''); // Load Tier
        setDescription(product.description || ''); // Handle missing description

        // Attempt to parse index from ID: PREFIX(including index)-OPTIONS
        // e.g. HYRGSSHL0001-SVFR
        try {
            const parts = product.id.split('-');
            if (parts[0]) {
                const idxStr = parts[0].slice(-4);
                const idx = parseInt(idxStr, 10);
                if (!isNaN(idx)) setIndex(idx);
                else setIndex(1);
            }
        } catch (e) {
            setIndex(1);
        }

        // Map options
        if (product.options && product.options.length > 0) {
            setOptions(product.options.map(opt => ({
                color: opt.color,
                size: opt.size,
                stock: opt.stock,
                // We need to decide how to split specific vs common when editing.
                // Since we merged them on save, we can't easily distinguish unless we store them separately or check against commonImages state (which isn't loaded yet/doesn't exist on product).
                // Actually, for now, we just load ALL images into the option's specific images list.
                // The common image feature is mostly for *creation* convenience.
                // If we want to support "editing common images" affecting all, we'd need a schema change or convention.
                // Current Requirement: "Upload common, and specific. Show specific then common."
                // On Edit: We just load what's saved. If the user wants to add common again, they can, but it might duplicate.
                // Let's keep it simple: specific images load as is. Common images input starts empty on edit.
                imageNames: opt.images || []
            })));
        } else {
            setOptions([{ color: 'SILVER', size: 'FR', stock: 10, imageNames: [] }]);
        }

        setCommonImages([]); // Reset common images on edit start to avoid confusion

        setMessage('');
        setView('form');
    };

    // Include SKU preview for the main product ID
    const mainId = generateSKU(theme, category, material, manufacturer, index, options[0]?.color || 'XX', options[0]?.size || 'XX');

    return (
        <div className="page-container">
            <div className={styles.adminContainer}>

                {view === 'dashboard' && (
                    <>
                        <div className={styles.dashboardHeader}>
                            <h2>Product Dashboard ({products.length})</h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className={styles.btnSecondary} onClick={handleLogout} style={{ fontSize: '0.9rem' }}>Logout</button>
                                <button className={styles.btnPrimary} onClick={handleCreateClick}>+ Create New Product</button>
                            </div>
                        </div>

                        {loading && <p>Loading products...</p>}

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>SKU / ID</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                {product.options && product.options[0]?.images && product.options[0].images.length > 0 ? (
                                                    <img
                                                        src={product.options[0].images[0]}
                                                        alt={product.name}
                                                        className={styles.thumbnail}
                                                    />
                                                ) : (
                                                    <div className={styles.thumbnail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Img</div>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{product.name}</td>
                                            <td style={{ fontSize: '0.85rem', color: '#666' }}>{product.id}</td>
                                            <td>
                                                <span className={styles.badge}>{product.category}</span>
                                            </td>
                                            <td>₩{product.price.toLocaleString()}</td>
                                            <td>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => handleEditClick(product)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && products.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                                No products found. Add one to get started!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {view === 'form' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <button className={styles.btnSecondary} onClick={() => setView('dashboard')}>
                                &larr; Back to Dashboard
                            </button>
                            {message && <span style={{ color: message.includes('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{message}</span>}
                        </div>

                        <h1 className={styles.title}>{isEditing ? 'Edit Product' : 'Create New Product'}</h1>

                        <div className={styles.formGroup}>
                            <div className={styles.sectionTitle}>Basic Information</div>
                            <div className={styles.row}>
                                <div className={styles.col}>
                                    <label className={styles.label}>Product Name</label>
                                    <input
                                        className={styles.input}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Hype Silver Ring"
                                    />
                                </div>
                                <div className={styles.col}>
                                    <label className={styles.label}>Wholesale Cost (KRW)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={cost}
                                        onChange={handleCostChange}
                                        placeholder="Enter cost to auto-calc"
                                        style={{ borderColor: '#0070f3' }}
                                    />
                                </div>
                                <div className={styles.col}>
                                    <label className={styles.label}>Price Tier (Auto)</label>
                                    <input
                                        className={styles.input}
                                        value={tier}
                                        readOnly
                                        style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}
                                    />
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.col}>
                                    <label className={styles.label}>Retail Price (KRW)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div className={styles.col}>
                                    <label className={styles.label}>Retail Price (USD)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={priceUsd}
                                        onChange={(e) => setPriceUsd(e.target.value)}
                                    />
                                </div>
                                <div className={styles.col}>
                                    <label className={styles.label}>Retail Price (THB)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={priceTHB}
                                        onChange={(e) => setPriceTHB(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={styles.col}>
                                <label className={styles.label}>Description</label>
                                <textarea
                                    className={styles.textarea}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Product description..."
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <div className={styles.sectionTitle}>Attributes (SKU Components)</div>
                            <div className={styles.row}>
                                <div className={styles.col}>
                                    <label className={styles.label}>Theme</label>
                                    <select className={styles.select} value={theme} onChange={(e) => setTheme(e.target.value)}>
                                        {Object.keys(THEMES).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div className={styles.col}>
                                    <label className={styles.label}>Category</label>
                                    <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                                        {Object.keys(CATEGORIES).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.col}>
                                    <label className={styles.label}>Material</label>
                                    <select className={styles.select} value={material} onChange={(e) => setMaterial(e.target.value)}>
                                        {Object.keys(MATERIALS).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div className={styles.col}>
                                    <label className={styles.label}>Manufacturer</label>
                                    <select className={styles.select} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
                                        {Object.keys(MANUFACTURERS).map(k => (
                                            <option key={k} value={k}>
                                                {k} ({MANUFACTURERS[k]})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.col}>
                                    <label className={styles.label}>Index Number</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={index}
                                        onChange={(e) => setIndex(e.target.value)}
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div className={styles.skuPreview}>
                                Main SKU Preview: {mainId}
                            </div>
                        </div>

                        {/* Common Images Section */}
                        <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Common Images (Applied to All Options)</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                                Images uploaded here will be shown for ALL options. <br />
                                If an option has its own images, they will be shown <strong>first</strong>, followed by these common images.
                            </p>

                            <div
                                className={`${styles.dropZone} ${dragActiveIndex === 'common' ? styles.dropZoneActive : ''}`}
                                onDragEnter={(e) => handleDrag(e, 'common')}
                                onDragLeave={(e) => handleDrag(e, 'common')}
                                onDragOver={(e) => handleDrag(e, 'common')}
                                onDrop={(e) => handleDrop(e, 'common')}
                                onClick={() => document.getElementById(`common-image-upload`).click()}
                            >
                                <div className={styles.dropIcon}>☁️</div>
                                <span>Drag & Drop Common Images Here</span>
                                <span style={{ fontSize: '0.8rem', color: '#999' }}>or click to upload</span>
                                <input
                                    id={`common-image-upload`}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleCommonImageUpload(e.target.files)}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {/* Common Image Previews */}
                            {commonImages.length > 0 && (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                    {commonImages.map((img, i) => (
                                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <img src={img} alt={`Common ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                            <button
                                                onClick={() => removeCommonImage(i)}
                                                style={{
                                                    position: 'absolute', top: -5, right: -5,
                                                    background: 'red', color: 'white', border: 'none',
                                                    borderRadius: '50%', width: '20px', height: '20px',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <div className={styles.sectionTitle}>Options (Variants)</div>
                            {options.map((opt, idx) => (
                                <div key={idx} className={styles.optionBlock}>
                                    <div className={styles.row}>
                                        <div className={styles.col}>
                                            <label className={styles.label}>Color</label>
                                            <select
                                                className={styles.select}
                                                value={opt.color}
                                                onChange={(e) => handleOptionChange(idx, 'color', e.target.value)}
                                            >
                                                {Object.keys(COLORS).map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                        <div className={styles.col}>
                                            <label className={styles.label}>Size</label>
                                            <input
                                                className={styles.input}
                                                value={opt.size}
                                                onChange={(e) => handleOptionChange(idx, 'size', e.target.value)}
                                                placeholder="e.g. 12 or FR"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.col}>
                                            <label className={styles.label}>Stock</label>
                                            <input
                                                type="number"
                                                className={styles.input}
                                                value={opt.stock}
                                                onChange={(e) => handleOptionChange(idx, 'stock', e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.col}>
                                            <label className={styles.label}>Product Images</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {/* Image Gallery */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {opt.imageNames && opt.imageNames.map((imgUrl, imgIdx) => (
                                                        <div key={imgIdx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                                            <img
                                                                src={imgUrl}
                                                                alt={`Preview ${imgIdx}`}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                                            />
                                                            <button
                                                                onClick={() => removeImage(idx, imgIdx)}
                                                                style={{
                                                                    position: 'absolute', top: '-5px', right: '-5px',
                                                                    background: 'red', color: 'white', border: 'none',
                                                                    borderRadius: '50%', width: '18px', height: '18px',
                                                                    cursor: 'pointer', fontSize: '10px', display: 'flex',
                                                                    alignItems: 'center', justifyContent: 'center'
                                                                }}
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Upload Input with Drag & Drop */}
                                                <div
                                                    className={`${styles.dropZone} ${dragActiveIndex === idx ? styles.dropZoneActive : ''}`}
                                                    onDragEnter={(e) => handleDrag(e, idx)}
                                                    onDragLeave={(e) => handleDrag(e, idx)}
                                                    onDragOver={(e) => handleDrag(e, idx)}
                                                    onDrop={(e) => handleDrop(e, idx)}
                                                    onClick={() => document.getElementById(`file-input-${idx}`).click()}
                                                >
                                                    <div className={styles.dropIcon}>☁️</div>
                                                    <p>Drag & Drop images here or click to upload</p>
                                                    <input
                                                        id={`file-input-${idx}`}
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={(e) => handleImageUpload(idx, e.target.files)}
                                                        style={{ display: 'none' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {options.length > 1 && (
                                        <button className={styles.btnSecondary} onClick={() => removeOption(idx)} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                                            Remove Option
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button className={styles.btnSecondary} onClick={addOption}>+ Add Another Option</button>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button className={styles.btnSecondary} onClick={() => setView('dashboard')}>Cancel</button>
                            {isEditing && (
                                <button
                                    className={styles.btnSecondary}
                                    onClick={handleDelete}
                                    style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                                >
                                    Delete Product
                                </button>
                            )}
                            <button
                                className={styles.btnPrimary}
                                onClick={handleSave}
                                disabled={loading}
                                style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                            >
                                {loading ? 'Processing...' : (isEditing ? 'Update Product' : 'Create Product')}
                            </button>
                        </div>

                        <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '2px solid #ff4444' }}>
                            <h3 style={{ color: '#ff4444' }}>Danger Zone</h3>
                            <button
                                onClick={async () => {
                                    if (window.confirm('WARNING: This will delete ALL products and options! This action cannot be undone. Are you sure?')) {
                                        setLoading(true);
                                        const { error: optErr } = await supabase.from('product_options').delete().neq('id', 0); // Delete all options
                                        const { error: prodErr } = await supabase.from('products').delete().neq('id', 'placeholder'); // Delete all products

                                        if (optErr || prodErr) {
                                            alert('Error resetting DB: ' + (optErr?.message || prodErr?.message));
                                        } else {
                                            alert('Database has been reset successfully.');
                                            setProducts([]);
                                            setView('dashboard');
                                        }
                                        setLoading(false);
                                    }
                                }}
                                style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Reset Entire Database
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Admin;
