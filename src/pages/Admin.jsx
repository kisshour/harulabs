
import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { generateSKU, THEMES, CATEGORIES, MATERIALS, COLORS } from '../utils/skuGenerator';
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
    const [index, setIndex] = useState(1);
    const [price, setPrice] = useState(0);
    const [cost, setCost] = useState(0); // Wholesale Cost
    const [priceUsd, setPriceUsd] = useState(0); // USD Price
    const [priceThb, setPriceThb] = useState(0); // THB Price
    const [tier, setTier] = useState(''); // Tier (e.g., 'Tier 1')
    const [description, setDescription] = useState('');

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
            setPriceThb(match.thb);
            setTier(match.name);
        } else {
            // Optional: reset or keep manual?
            setTier('');
        }
    };

    // Options State (Starting with one default option)
    const [options, setOptions] = useState([
        { color: 'SILVER', size: 'FR', stock: 10, imageName: '' }
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
        const mainId = generateSKU(theme, category, material, index, options[0]?.color || 'XX', options[0]?.size || 'XX');

        // 2. Prepare Data
        const productData = {
            id: mainId,
            name,
            theme,
            category,
            price: Number(price), // KRW Retail
            cost: Number(cost), // Wholesale Cost
            price_usd: Number(priceUsd), // USD Retail
            price_thb: Number(priceThb), // THB Retail
            description,
            material
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

        // Prepare new options
        const optionsToInsert = options.map(opt => ({
            product_id: mainId,
            sku: generateSKU(theme, category, material, index, opt.color, opt.size), // Ensure unique SKU for option
            color: opt.color,
            size: opt.size,
            stock: Number(opt.stock),
            images: opt.imageName ? (opt.imageName.startsWith('http') ? [opt.imageName] : [`/assets/products/${opt.imageName}`]) : []
        }));

        const { error: optionsError } = await supabase
            .from('product_options')
            .insert(optionsToInsert);

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
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setMessage('Deleting product...');

        // 1. Delete linked options first (to avoid FK constraint issues if CASCADE is missing)
        const { error: optionsError } = await supabase
            .from('product_options')
            .delete()
            .eq('product_id', mainId);

        if (optionsError) {
            console.error('Error deleting options:', optionsError);
            setMessage(`Error deleting options: ${optionsError.message}`);
            setLoading(false);
            return;
        }

        // 2. Delete the product
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', mainId);

        if (error) {
            console.error('Error deleting product:', error);
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Product deleted successfully!');
            await fetchProductsFromDB(); // Wait for fetch
            setTimeout(() => {
                setView('dashboard');
                setMessage('');
            }, 1000);
        }
        setLoading(false);
    };


    // Handlers
    const handleOptionChange = (idx, field, value) => {
        const newOptions = [...options];
        newOptions[idx][field] = value;
        setOptions(newOptions);
    };

    const handleImageUpload = async (idx, file) => {
        if (!file) return;
        setLoading(true); // Block interaction
        setMessage('Uploading image... Please wait.');
        try {
            const publicUrl = await uploadImage(file);
            console.log('Upload successful:', publicUrl);

            // Deep copy options to ensure state update triggers correctly
            const newOptions = options.map((opt, i) => i === idx ? { ...opt, imageName: publicUrl } : opt);
            setOptions(newOptions);

            setMessage('Image uploaded successfully!');
            // Optional: Alert removed to be less annoying if it works, but keeping for debugging if requested.
            // But since user is having trouble, let's keep it visible in UI message.
        } catch (error) {
            console.error('Upload failed:', error);
            setMessage(`Image upload failed: ${error.message}`);
            alert(`이미지 업로드 실패: ${error.message}\nSupabase Storage의 'products' 버킷 정책(Policy)을 확인해주세요.`);
        } finally {
            setLoading(false);
        }
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
    }, [theme, category, material, isEditing, view]);

    const fetchNextIndex = async () => {
        // Find existing products with same prefix to determine max index
        const prefix = `${THEMES[theme]}${CATEGORIES[category]}${MATERIALS[material]}`;
        // Query database for IDs starting with this prefix
        // Since we can't do complex regex easily on client side without fetching all, 
        // let's just fetch all and filter client side for now as dataset is small, 
        // or rely on 'products' state if it contains all.
        // Better: Use products state which is already loaded.

        let maxIdx = 0;
        products.forEach(p => {
            // ID format: PREFIX-INDEX...
            if (p.id.startsWith(prefix)) {
                const parts = p.id.split('-');
                if (parts[1]) {
                    // Extract index part (first 4 chars of second part)
                    const idxStr = parts[1].substring(0, 4);
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
        setIsEditing(false);
        setName('');
        setTheme('HYPE');
        setCategory('RING');
        setMaterial('SURGICAL_STEEL');
        // Index will be set by useEffect
        setPrice(0);
        setCost(0);
        setPriceUsd(0);
        setPriceThb(0);
        setTier('');
        setDescription('');
        setOptions([{ color: 'SILVER', size: 'FR', stock: 10, imageName: '' }]);
        setMessage('');
        setView('form');
    };

    // Initialize Form for Editing
    const handleEditClick = (product) => {
        setIsEditing(true);
        setName(product.name);
        setTheme(product.theme);
        setCategory(product.category);
        setMaterial(product.material);
        setPrice(product.price);
        setCost(product.cost || 0); // Load cost
        setPriceUsd(product.price_usd || 0); // Load USD price
        setPriceThb(product.price_thb || 0); // Load THB
        setTier(product.tier || ''); // Load Tier
        setDescription(product.description || ''); // Handle missing description

        // Attempt to parse index from ID: THEME-CAT-MAT-INDEX-COL-SZ
        try {
            const parts = product.id.split('-');
            const idx = parseInt(parts[3], 10);
            if (!isNaN(idx)) setIndex(idx);
            else setIndex(1);
        } catch (e) {
            setIndex(1);
        }

        // Map options
        if (product.options && product.options.length > 0) {
            setOptions(product.options.map(opt => ({
                color: opt.color,
                size: opt.size,
                stock: opt.stock,
                imageName: opt.images && opt.images.length > 0 ? opt.images[0].split('/').pop() : ''
            })));
        } else {
            setOptions([{ color: 'SILVER', size: 'FR', stock: 10, imageName: '' }]);
        }

        setMessage('');
        setView('form');
    };

    // Include SKU preview for the main product ID
    const mainId = generateSKU(theme, category, material, index, options[0]?.color || 'XX', options[0]?.size || 'XX');

    return (
        <div className="page-container">
            <div className={styles.adminContainer}>

                {view === 'dashboard' && (
                    <>
                        <div className={styles.dashboardHeader}>
                            <h1 className={styles.title} style={{ marginBottom: 0 }}>Product Dashboard</h1>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className={styles.btnSecondary} onClick={handleLogout} style={{ fontSize: '0.9rem' }}>Logout</button>
                                <button className={styles.btnPrimary} onClick={handleCreateClick}>+ Add New Product</button>
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
                                                {product.options && product.options[0]?.images && product.options[0].images[0] ? (
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
                                        value={priceThb}
                                        onChange={(e) => setPriceThb(e.target.value)}
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
                                            <label className={styles.label}>Product Image</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {opt.imageName && (
                                                    <img
                                                        src={opt.imageName.startsWith('http') ? opt.imageName : `/assets/products/${opt.imageName}`}
                                                        alt="Preview"
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                                    />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(idx, e.target.files[0])}
                                                    style={{ fontSize: '0.9rem' }}
                                                />
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
                    </>
                )}
            </div>
        </div>
    );
};

export default Admin;
