
import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { generateSKU, THEMES, CATEGORIES, MATERIALS, MAIN_COLORS, SUB_COLORS } from '../utils/skuGenerator';
import { supabase } from '../utils/supabaseClient';
import { fetchProducts, uploadImage } from '../services/productService';
import { useNavigate, Link } from 'react-router-dom';

const TIER_RANGES = [
    { name: 'Tier-UR1', min: 0, max: 2000, krw: 9900, usd: 6.99, thb: 199 },
    { name: 'Tier-UR2', min: 2001, max: 4000, krw: 14900, usd: 10.99, thb: 299 },
    { name: 'Tier-UR3', min: 4001, max: 5500, krw: 19900, usd: 14.99, thb: 399 },
    { name: 'Tier-UR4', min: 5501, max: 8000, krw: 24900, usd: 18.99, thb: 499 },
    { name: 'Tier-RH1', min: 16000, max: 19000, krw: 49000, usd: 34.99, thb: 999 },
];

const Admin = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'form'
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    // Filter & Sort Products based on Search Term and Index
    const filteredProducts = products
        .filter(product => {
            if (!searchTerm) return true;
            const lowerTerm = searchTerm.toLowerCase();
            return (
                product.name.toLowerCase().includes(lowerTerm) ||
                product.id.toLowerCase().includes(lowerTerm) ||
                (product.theme && product.theme.toLowerCase().includes(lowerTerm)) ||
                (product.category && product.category.toLowerCase().includes(lowerTerm))
            );
        })
        .sort((a, b) => {
            const regex = /^[A-Z]{2,}[-_]?(\d{4})/i;
            const matchA = a.id.match(regex);
            const matchB = b.id.match(regex);
            const valA = matchA ? parseInt(matchA[1], 10) : 0;
            const valB = matchB ? parseInt(matchB[1], 10) : 0;
            return valB - valA; // Descending order (Latest/Highest Index first)
        });

    // Calculate Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const toggleRow = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null); // Track original ID for editing/deleting
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Form State
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('URBAN');
    const [category, setCategory] = useState('RING');
    const [material, setMaterial] = useState('SURGICAL_STEEL');
    const [index, setIndex] = useState(1);
    const [price, setPrice] = useState(0);
    const [cost, setCost] = useState(0); // Wholesale Cost
    const [priceUsd, setPriceUsd] = useState(0); // USD Price
    const [priceTHB, setPriceTHB] = useState(0); // THB Price
    const [tier, setTier] = useState(''); // Tier (e.g., 'Tier 1')
    const [description, setDescription] = useState('');
    const [purchaseInfo, setPurchaseInfo] = useState(''); // New: Purchase Information
    const [dragActiveIndex, setDragActiveIndex] = useState(null);
    const [commonImages, setCommonImages] = useState([]); // Shared images for all options

    // Pricing Logic
    const calculatePricing = (inputCost) => {
        const match = TIER_RANGES.find(t => inputCost >= t.min && inputCost <= t.max);
        if (match) {
            return {
                price: match.krw,
                priceUsd: match.usd,
                priceTHB: match.thb,
                tier: match.name
            };
        }
        return { price: 0, priceUsd: 0, priceTHB: 0, tier: '' };
    };

    const handleCostChange = (e) => {
        const newCost = Number(e.target.value);
        setCost(newCost);

        const pricing = calculatePricing(newCost);
        setPrice(pricing.price);
        setPriceUsd(pricing.priceUsd);
        setPriceTHB(pricing.priceTHB);
        setTier(pricing.tier);

        // Auto-select Theme based on Tier logic
        if (pricing.tier.startsWith('Tier-UR')) {
            setTheme('URBAN');
        } else if (pricing.tier.startsWith('Tier-RH')) {
            setTheme('RHYTHM');
        }
    };

    // Options State (Starting with one default option)
    // Options State (Starting with one default option)
    const [options, setOptions] = useState([
        {
            theme: 'URBAN', category: 'RING', material: 'SURGICAL_STEEL',
            mainColor: 'SILVER', subColor: 'ETC', size: 'FR', stock: 999,
            cost: 0, price: 0, priceUsd: 0, priceTHB: 0, tier: '',
            imageNames: []
        }
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
            setLoading(false);
            return [];
        } else {
            setProducts(data || []);
            setLoading(false);
            return data || [];
        }
    };

    // --- RECENT IMPROVEMENT: Deep Cleanup Tool (v3 - Paginated & Aggressive) ---
    const runDeepCleanup = async () => {
        if (!window.confirm('Are you sure you want to clean all image duplicates in the database? This will handle thousands of options and normalize all URLs.')) return;

        setLoading(true);
        setMessage('Starting deep cleanup...');

        try {
            let totalFixed = 0;
            let offset = 0;
            const limit = 1000;
            let hasMore = true;

            while (hasMore) {
                setMessage(`Cleaning batch starting at ${offset}...`);
                const { data: options, error } = await supabase
                    .from('product_options')
                    .select('id, images, sku, product_id, color, sub_color, size')
                    .range(offset, offset + limit - 1);

                if (error) throw error;
                if (!options || options.length === 0) {
                    hasMore = false;
                    break;
                }

                // --- NEW: ROW-LEVEL DEDUPLICATION ---
                const seenKeys = new Map();
                for (const opt of options) {
                    const key = `${opt.product_id || 'unknown'}|${opt.color}|${opt.sub_color}|${opt.size}`;
                    if (seenKeys.has(key)) {
                        // Duplicate row! Delete it.
                        console.warn(`Duplicate row detected for key ${key}. Deleting ID ${opt.id}`);
                        await supabase.from('product_options').delete().eq('id', opt.id);
                        totalFixed++;
                        continue;
                    }
                    seenKeys.set(key, opt.id);

                    if (!opt.images || opt.images.length === 0) continue;
                    // ... (previous image cleaning logic follows)

                    const unique = [];
                    const seen = new Set();
                    let changed = false;

                    for (const img of opt.images) {
                        if (!img || typeof img !== 'string') continue;

                        // Aggressive normalization: Trim, Lowercase extension part, Fix slashes
                        const parts = img.trim().split('.');
                        const ext = parts.pop().toLowerCase();
                        const base = parts.join('.');
                        const norm = (base + '.' + ext).replace(/([^:])\/\//g, '$1/');

                        if (seen.has(norm)) {
                            changed = true;
                            continue;
                        }
                        seen.add(norm);
                        unique.push(norm);
                        if (norm !== img) changed = true;
                    }

                    if (changed || unique.length < opt.images.length) {
                        const { error: uError } = await supabase.from('product_options').update({ images: unique }).eq('id', opt.id);
                        if (!uError) totalFixed++;
                    }
                }

                if (options.length < limit) {
                    hasMore = false;
                } else {
                    offset += limit;
                }
            }

            setMessage(`Cleanup Finished! Total fixed: ${totalFixed} options.`);
            await fetchProductsFromDB();
        } catch (err) {
            console.error('Deep Cleanup failed:', err);
            setMessage(`Deep Cleanup failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Save Logic (Create or Update)
    const handleSave = async () => {
        setLoading(true);
        setMessage('Saving...');

        // 0. Validation
        if (!name || name.trim() === '') {
            setMessage('Error: Product Name is required!');
            setLoading(false);
            return;
        }

        // Check for duplicate name (case-insensitive)
        const duplicateName = products.find(p =>
            p.name.trim().toLowerCase() === name.trim().toLowerCase() &&
            (!isEditing || p.id !== editingId)
        );

        if (duplicateName) {
            setMessage('Error: Product Name already exists!');
            setLoading(false);
            return;
        }

        // Check for duplicate options within the form (Color + SubColor + Size)
        const seenOptions = new Set();
        let hasDuplicateOption = false;

        for (const opt of options) {
            const key = `${opt.mainColor}-${opt.subColor}-${opt.size}`;
            if (seenOptions.has(key)) {
                hasDuplicateOption = true;
                break;
            }
            seenOptions.add(key);
        }

        if (hasDuplicateOption) {
            setMessage('Error: Duplicate options (Color/Option/Size) detected!');
            setLoading(false);
            return;
        }

        // 1. Construct Main Product ID
        // If editing, keep the original ID to prevent duplication
        const mainId = isEditing ? editingId : generateSKU(theme, category, material, index, options[0]?.mainColor || 'SILVER', options[0]?.subColor || 'ETC', options[0]?.size || 'XX');

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
            purchase_info: purchaseInfo,
            material
        };

        // Check for duplicates if creating new
        if (!isEditing) {
            const prefix = `${THEMES[theme]}${CATEGORIES[category]}${MATERIALS[material]}`;
            const indexCode = String(index).padStart(4, '0');
            const targetIdBase = `${prefix}${indexCode}`;

            const exists = products.some(p => {
                // Check if any existing product ID starts with the same Theme+Cat+Mat+Index
                // ID Format: HYRGSS0001-SVFR
                const pIdBase = p.id.split('-')[0];
                return pIdBase === targetIdBase;
            });

            console.log('Duplicate Check:', { targetIdBase, exists });

            if (exists) {
                setMessage(`Error: Product Index ${index} for this category already exists! (ID: ${targetIdBase}...)`);
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
        const { error: deleteError } = await supabase.from('product_options').delete().eq('product_id', mainId);

        if (deleteError) {
            console.error('Failed to delete existing options:', deleteError);
            setMessage(`Critical Error: Could not refresh options. ${deleteError.message}`);
            setLoading(false);
            return;
        }

        // Prepare Options Data
        // Merge specific images with common images (Specific First + Common Last)
        const optionsData = options.map(opt => {
            // If option has specific images, use them. 
            // Then append common images.
            // If option has NO specific images, it will just be common images.
            // AND ensure no duplicates if someone uploads same image to both? (Unlikely workflow but possible)
            // For now, simple concatenation as requested: "Specific then Common".

            const combinedImages = [...(opt.imageNames || []), ...commonImages];

            return {
                product_id: mainId,
                sku: generateSKU(theme, category, material, index, opt.mainColor, opt.subColor, opt.size),
                color: opt.mainColor, // Store Main Color in 'color' column
                sub_color: opt.subColor, // Store Sub Color in new column
                size: opt.size,
                stock: Number(opt.stock),
                cost: Number(opt.cost), // Store Option Cost
                price: Number(opt.price),
                price_usd: Number(opt.priceUsd), // Note naming convention snake_case for DB? productService expects object keys to match DB or be mapped?
                // Let's check productService. It maps opt.price_usd etc.
                price_thb: Number(opt.priceTHB),
                tier: opt.tier,
                // Save these just in case, though they are now product-level mostly
                theme: theme,
                category: category,
                material: material,
                purchase_info: purchaseInfo, // Also inheritance
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

        // Auto-calculate pricing if cost changes
        if (field === 'cost') {
            const costVal = Number(value);
            const pricing = calculatePricing(costVal);
            newOptions[idx].price = pricing.price;
            newOptions[idx].priceUsd = pricing.priceUsd;
            newOptions[idx].priceTHB = pricing.priceTHB;
            newOptions[idx].tier = pricing.tier;
        }

        // Auto-update price if manual tier changes from dropdown
        if (field === 'tier') {
            const match = TIER_RANGES.find(t => t.name === value);
            if (match) {
                newOptions[idx].price = match.krw;
                newOptions[idx].priceUsd = match.usd;
                newOptions[idx].priceTHB = match.thb;
            }
        }

        setOptions(newOptions);
    };

    const handleImageUpload = async (idx, files) => {
        if (!files || files.length === 0) return;

        // --- CLIENT-SIDE DEDUPLICATION ---
        // Check if these files are already in THIS option
        const currentImages = options[idx].imageNames || [];
        // We can't check by URL easily if they haven't been uploaded, 
        // but we can at least wait to see if someone is spam clicking same file.
        // For now, let's proceed but filter the files array if possible.

        setLoading(true);
        setMessage('Uploading images... Please wait.');

        try {
            const uploadedUrls = [];
            const uploadPromises = Array.from(files).map(file => uploadImage(file));
            const results = await Promise.all(uploadPromises);

            uploadedUrls.push(...results);
            console.log('Uploads successful:', uploadedUrls);

            // Append and Deduplicate URLs 
            const newOptions = [...options];
            const combined = [...(newOptions[idx].imageNames || []), ...uploadedUrls];
            newOptions[idx].imageNames = [...new Set(combined.map(u => u.trim()))];
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

            // Deduplicate URLs in case of accidental double upload
            const combined = [...commonImages, ...uploadedUrls];
            setCommonImages([...new Set(combined.map(u => u.trim()))]);

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
        // Inherit base defaults? We removed default settings inputs.
        // So just use reasonable defaults.
        setOptions([...options, {
            theme: 'URBAN', category: 'RING', material: 'SURGICAL_STEEL',
            mainColor: 'SILVER', subColor: 'ETC', size: 'FR', stock: 999,
            cost: 0,
            price: 0, priceUsd: 0, priceTHB: 0, tier: '',
            imageNames: []
        }]);
    };

    const removeOption = (idx) => {
        if (options.length > 1) {
            const newOptions = options.filter((_, i) => i !== idx);
            setOptions(newOptions);
        }
    };

    // Get next available index when parameters change
    // Since Specs are now per-option, we can't auto-fetch index globally.
    // We could add a "Fetch Index" button near the index input, or auto-fetch when Spec changes for that option?
    // For now, let's rely on the Default Settings to set the initial index, 
    // and maybe disable auto-fetch for every single option change to avoid chaos.
    // We'll keep a "Default Index" in state that auto-updates, and new options inherit it.
    useEffect(() => {
        if (!isEditing && view === 'form') {
            fetchNextIndex();
        }
    }, [theme, category, material, isEditing, view, products.length]);

    const fetchNextIndex = async () => {
        // Find maximum index globally across all products (regardless of prefix)
        // because user seemingly expects a running serial number.

        // Ensure we iterate over something
        let listToScan = products;
        if (products.length === 0 && !loading) {
            const loaded = await fetchProductsFromDB();
            if (loaded && loaded.length > 0) listToScan = loaded;
        }

        let maxIdx = 0;
        // Regex: Any Prefix (A-Z) + optional separator + 4 Digits
        // e.g. URRGSS0001 or HY-NK-SS-0005
        const regex = /^[A-Z]{2,}[-_]?(\d{4})/i;

        (listToScan || []).forEach(p => {
            if (p && p.id) {
                const match = p.id.match(regex);
                if (match && match[1]) {
                    const idx = parseInt(match[1], 10);
                    // console.log(`Found match: ${p.id}, extracted idx: ${idx}`);
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
            setTheme('URBAN');
            setCategory('RING');
            setMaterial('SURGICAL_STEEL');
            // Index will be set by useEffect
            setPrice(0);
            setCost(0);
            setPriceUsd(0);
            setPriceTHB(0);
            setTier('');
            setDescription('');
            setPurchaseInfo('');
            setPurchaseInfo('');
            setOptions([{
                theme: 'URBAN', category: 'RING', material: 'SURGICAL_STEEL', index: 1,
                mainColor: 'SILVER', subColor: 'ETC', size: 'FR', stock: 999,
                cost: 0, price: 0, priceUsd: 0, priceTHB: 0, tier: '', purchaseInfo: '',
                imageNames: []
            }]);
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

        const initialTheme = product.theme || (product.options && product.options[0]?.theme) || 'URBAN';
        const initialCategory = product.category || (product.options && product.options[0]?.category) || 'RING';
        const initialMaterial = product.material || (product.options && product.options[0]?.material) || 'SURGICAL_STEEL';

        // Initialize state
        setName(product.name || '');
        setTheme(initialTheme);
        setCategory(initialCategory);
        setMaterial(initialMaterial);
        setPrice(product.price || 0);
        setCost(product.cost || 0);
        setPriceUsd(product.price_usd || 0);
        setPriceTHB(product.price_thb || 0);
        setTier(product.tier || '');
        setDescription(product.description || '');
        setPurchaseInfo(product.purchase_info || '');

        // SKU Logic
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
                theme: initialTheme, // Inherit from product level logic
                category: initialCategory,
                material: initialMaterial,
                // Map DB columns to State keys
                mainColor: opt.color || 'SILVER',
                subColor: opt.sub_color || 'ETC',
                size: opt.size || 'FR',
                stock: opt.stock || 999,
                cost: opt.cost || 0,
                price: opt.price || 0,
                priceUsd: opt.price_usd || 0,
                priceTHB: opt.price_thb || 0,
                tier: opt.tier || '',
                purchaseInfo: opt.purchase_info || '', // Just in case, though likely ignored now
                imageNames: opt.images || []
            })));
        } else {
            setOptions([{
                theme: initialTheme, category: initialCategory, material: initialMaterial,
                mainColor: 'SILVER', subColor: 'ETC', size: 'FR', stock: 999,
                cost: 0, price: 0, priceUsd: 0, priceTHB: 0, tier: '', purchaseInfo: '',
                imageNames: []
            }]);
        }

        setCommonImages([]); // Reset common images on edit start to avoid confusion

        setMessage('');
        setView('form');
    };

    // Include SKU preview for the main product ID (Primary Option)
    const primaryOpt = options[0];
    const mainId = generateSKU(primaryOpt?.theme || 'XX', primaryOpt?.category || 'XX', primaryOpt?.material || 'XX', primaryOpt?.index || 0, primaryOpt?.mainColor || 'SILVER', primaryOpt?.subColor || 'ETC', primaryOpt?.size || 'XX');

    return (
        <div className="page-container">
            <div className={styles.adminContainer}>

                {view === 'dashboard' && (
                    <>
                        <div className={styles.dashboardHeader}>
                            <h2>Product Dashboard ({filteredProducts.length})</h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        width: '200px'
                                    }}
                                />
                                <button className={styles.btnSecondary} onClick={handleLogout} style={{ fontSize: '0.9rem' }}>Logout</button>
                                <button className={styles.btnPrimary} onClick={handleCreateClick}>+ Create New Product</button>
                            </div>
                        </div>

                        {loading && <p>Loading products...</p>}

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}></th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>SKU / ID</th>
                                        <th>Collection</th>
                                        <th>Category</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((product) => (
                                        <React.Fragment key={product.id}>
                                            <tr style={{ background: expandedRows[product.id] ? '#f9f9f9' : 'transparent' }}>
                                                <td style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleRow(product.id)}>
                                                    {expandedRows[product.id] ? '▼' : '▶'}
                                                </td>
                                                <td>
                                                    <Link to={`/product/${product.id}`}>
                                                        {product.options && product.options[0]?.images && product.options[0].images.length > 0 ? (
                                                            <img
                                                                src={product.options[0].images[0]}
                                                                alt={product.name}
                                                                className={styles.thumbnail}
                                                            />
                                                        ) : (
                                                            <div className={styles.thumbnail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Img</div>
                                                        )}
                                                    </Link>
                                                </td>
                                                <td style={{ fontWeight: 500 }}>
                                                    <Link to={`/product/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        {product.name}
                                                    </Link>
                                                </td>
                                                <td style={{ fontSize: '0.85rem', color: '#666' }}>{product.id}</td>
                                                <td style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                                    <span className={styles.badge}>{product.theme}</span>
                                                </td>
                                                <td>
                                                    <span className={styles.badge}>{product.category}</span>
                                                </td>
                                                <td>
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => handleEditClick(product)}
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRows[product.id] && (
                                                <tr>
                                                    <td colSpan="7" style={{ padding: '0 0 20px 50px', backgroundColor: '#f9f9f9' }}>
                                                        <div style={{ padding: '10px', background: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
                                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Variants (Options)</h4>
                                                            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                                                <thead>
                                                                    <tr style={{ borderBottom: '1px solid #eee', color: '#666' }}>
                                                                        <th style={{ padding: '5px', textAlign: 'left' }}>SKU</th>
                                                                        <th style={{ padding: '5px', textAlign: 'left' }}>Color</th>
                                                                        <th style={{ padding: '5px', textAlign: 'left' }}>Option</th>
                                                                        <th style={{ padding: '5px', textAlign: 'left' }}>Size</th>
                                                                        <th style={{ padding: '5px', textAlign: 'left' }}>Cost</th>
                                                                        <th style={{ padding: '5px', textAlign: 'left' }}>Price/Tier</th>
                                                                        <th style={{ padding: '5px', textAlign: 'left' }}>Image</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {product.options && product.options.map((opt, idx) => (
                                                                        <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                                                            <td style={{ padding: '8px 5px', fontFamily: 'monospace' }}>
                                                                                {/* Use the actual saved SKU from the options table */}
                                                                                {opt.sku}
                                                                            </td>
                                                                            <td style={{ padding: '8px 5px' }}>{opt.color}</td>
                                                                            <td style={{ padding: '8px 5px' }}>{opt.sub_color || '-'}</td>
                                                                            <td style={{ padding: '8px 5px' }}>{opt.size}</td>
                                                                            <td style={{ padding: '8px 5px' }}>{opt.cost ? opt.cost.toLocaleString() : '-'}</td>
                                                                            <td style={{ padding: '8px 5px' }}>
                                                                                {opt.price ? opt.price.toLocaleString() : '-'} / {opt.tier || '-'}
                                                                            </td>
                                                                            <td style={{ padding: '8px 5px' }}>
                                                                                {opt.images && opt.images.length > 0 ? (
                                                                                    <img src={opt.images[0]} alt="opt" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '2px' }} />
                                                                                ) : '-'}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    {!loading && products.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                                No products found. Add one to get started!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredProducts.length > itemsPerPage && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={styles.btnSecondary}
                                    style={{ padding: '8px 12px', fontSize: '0.8rem', opacity: currentPage === 1 ? 0.5 : 1 }}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => handlePageChange(number)}
                                        className={currentPage === number ? styles.btnPrimary : styles.btnSecondary}
                                        style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                                    >
                                        {number}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={styles.btnSecondary}
                                    style={{ padding: '8px 12px', fontSize: '0.8rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {/* Tier Pricing Table */}
                        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                            <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', color: '#333' }}>Tier Pricing Reference</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#eee', color: '#333' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Tier Name</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Cost Range (KRW)</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Retail (KRW)</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Retail (USD)</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Retail (THB)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {TIER_RANGES.map((tier) => (
                                        <tr key={tier.name} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}><strong>{tier.name}</strong></td>
                                            <td style={{ padding: '10px' }}>{tier.min.toLocaleString()} ~ {tier.max.toLocaleString()}</td>
                                            <td style={{ padding: '10px' }}>{tier.krw.toLocaleString()}</td>
                                            <td style={{ padding: '10px' }}>{tier.usd}</td>
                                            <td style={{ padding: '10px' }}>{tier.thb}</td>
                                        </tr>
                                    ))}
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
                                    <label className={styles.label}>Index (Product Number)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={index}
                                        onChange={(e) => setIndex(e.target.value)}
                                    />
                                </div>
                            </div>
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
                                <div className={styles.col}>
                                    <label className={styles.label}>Material</label>
                                    <select className={styles.select} value={material} onChange={(e) => setMaterial(e.target.value)}>
                                        {Object.keys(MATERIALS).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
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
                            <div className={styles.col}>
                                <label className={styles.label}>Purchase Information (Private)</label>
                                <textarea
                                    className={styles.textarea}
                                    style={{ minHeight: '80px', backgroundColor: '#f9f9f9', border: '1px solid #ccc' }}
                                    value={purchaseInfo}
                                    onChange={(e) => setPurchaseInfo(e.target.value)}
                                    placeholder="Supplier info, cost details, links... (Admin Only)"
                                />
                            </div>
                        </div>

                        {/* Common Images Section */}

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
                                <div key={idx} className={styles.optionBlock} style={{ backgroundColor: '#fafafa', border: '1px solid #eee', padding: '15px', marginBottom: '15px' }}>

                                    {/* Specs Row */}
                                    <div style={{ marginBottom: '10px', color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        SKU: {generateSKU(theme, category, material, index, opt.mainColor, opt.subColor, opt.size || 'XX')}
                                    </div>

                                    <div className={styles.row}>
                                        <div className={styles.col}>
                                            <label className={styles.label}>Color</label>
                                            <select
                                                className={styles.select}
                                                value={opt.mainColor}
                                                onChange={(e) => handleOptionChange(idx, 'mainColor', e.target.value)}
                                            >
                                                {Object.keys(MAIN_COLORS).map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                        <div className={styles.col}>
                                            <label className={styles.label}>Option</label>
                                            <select
                                                className={styles.select}
                                                value={opt.subColor}
                                                onChange={(e) => handleOptionChange(idx, 'subColor', e.target.value)}
                                            >
                                                {Object.keys(SUB_COLORS).map(k => <option key={k} value={k}>{k}</option>)}
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
                                            <label className={styles.label}>Cost (Wholesale)</label>
                                            <input
                                                type="number"
                                                className={styles.input}
                                                value={opt.cost}
                                                onChange={(e) => handleOptionChange(idx, 'cost', e.target.value)}
                                                placeholder="Input Cost"
                                            />
                                        </div>
                                        <div className={styles.col} style={{ flex: 3 }}>
                                            <label className={styles.label}>Retail Prices</label>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', height: '40px', backgroundColor: '#f0f0f0', padding: '0 10px', borderRadius: '4px' }}>
                                                <span style={{ fontWeight: 'bold' }}>{opt.price ? opt.price.toLocaleString() : 0} KRW</span>
                                                <span style={{ color: '#ccc' }}>|</span>
                                                <span>${opt.priceUsd ? opt.priceUsd : 0}</span>
                                                <span style={{ color: '#ccc' }}>|</span>
                                                <span>{opt.priceTHB ? opt.priceTHB.toLocaleString() : 0} THB</span>
                                                <select
                                                    value={opt.tier || ''}
                                                    onChange={(e) => handleOptionChange(idx, 'tier', e.target.value)}
                                                    style={{ width: '90px', padding: '2px 4px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }}
                                                >
                                                    <option value="">Select Tier</option>
                                                    {TIER_RANGES.map((t) => (
                                                        <option key={t.name} value={t.name}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>


                                    <div className={styles.row}>
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
                            {message && (
                                <span style={{
                                    color: message.includes('Error') ? '#d32f2f' : '#2e7d32',
                                    fontWeight: 'bold',
                                    fontSize: '0.95rem',
                                    marginLeft: '10px',
                                    alignSelf: 'center'
                                }}>
                                    {message}
                                </span>
                            )}
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
        </div >
    );
};

export default Admin;
