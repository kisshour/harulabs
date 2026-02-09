
import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { generateSKU, THEMES, CATEGORIES, MATERIALS, COLORS } from '../utils/skuGenerator';
import { supabase } from '../utils/supabaseClient';

const Admin = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'form'
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('HYPE');
    const [category, setCategory] = useState('RING');
    const [material, setMaterial] = useState('SURGICAL_STEEL');
    const [index, setIndex] = useState(1);
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');

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
            price: Number(price),
            description,
            material
        };

        // 3. Upsert Product
        const { error: productError } = await supabase
            .from('products')
            .upsert(productData);

        if (productError) {
            console.error('Error saving product:', productError);
            setMessage(`Error: ${productError.message}`);
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
            images: opt.imageName ? [`/assets/products/${opt.imageName}`] : [] // Simplistic array handling for now
            // In future, upload image to storage and get URL
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


    // Handlers
    const handleOptionChange = (idx, field, value) => {
        const newOptions = [...options];
        newOptions[idx][field] = value;
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

    // Initialize Form for Creation
    const handleCreateClick = () => {
        setIsEditing(false);
        setName('');
        setTheme('HYPE');
        setCategory('RING');
        setMaterial('SURGICAL_STEEL');
        setIndex(1);
        setPrice(0);
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
        setDescription(product.description || '');

        try {
            const parts = product.id.split('-');
            const idx = parseInt(parts[3], 10);
            if (!isNaN(idx)) setIndex(idx);
            else setIndex(1);
        } catch (e) {
            setIndex(1);
        }

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
                            <button className={styles.btnPrimary} onClick={handleCreateClick}>+ Add New Product</button>
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
                                    <label className={styles.label}>Price (KRW)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
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
                                            <label className={styles.label}>Image Filename</label>
                                            <input
                                                className={styles.input}
                                                value={opt.imageName}
                                                onChange={(e) => handleOptionChange(idx, 'imageName', e.target.value)}
                                                placeholder="e.g. ring-1.jpg"
                                            />
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
                            <button className={styles.btnPrimary} onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Admin;
