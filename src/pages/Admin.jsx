
import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { generateSKU, THEMES, CATEGORIES, MATERIALS, COLORS } from '../utils/skuGenerator';


const Admin = () => {
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

    const [generatedCode, setGeneratedCode] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

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

    // Include SKU preview for the main product ID (using the first option's params as representative, or just generic params)
    // Actually, product ID logic depends on "Main Color/Size" which usually comes from the first option or a default.
    // Let's use the first option's color/size for the main ID suffix.
    const mainId = generateSKU(theme, category, material, index, options[0]?.color || 'XX', options[0]?.size || 'XX');

    const generateCode = () => {
        // Construct the product object
        const productData = {
            id: mainId,
            name: name,
            theme: theme,
            category: category,
            price: Number(price),
            description: description,
            material: material,
            options: options.map(opt => ({
                sku: generateSKU(theme, category, material, index, opt.color, opt.size),
                color: opt.color,
                size: opt.size,
                stock: Number(opt.stock),
                images: opt.imageName ? [`/assets/products/${opt.imageName}`] : []
            }))
        };

        // Format as string
        // We want it to look like code, not just JSON.stringify keys with quotes if possible, 
        // but valid JSON is easier to copy-paste. Let's make it look like the source code format.
        // Actually valid JSON is safer for data files, but our file is a .js module.
        // We'll generate an object literal string.

        let code = `  {\n`;
        code += `    id: generateSKU('${theme}', '${category}', '${material}', ${index}, '${options[0].color}', '${options[0].size}'),\n`;
        code += `    name: "${name}",\n`;
        code += `    theme: "${theme}",\n`;
        code += `    category: "${category}",\n`;
        code += `    price: ${price},\n`;
        code += `    description: "${description}",\n`;
        code += `    material: "${material}",\n`;
        code += `    options: [\n`;
        options.forEach(opt => {
            code += `      {\n`;
            code += `        sku: generateSKU('${theme}', '${category}', '${material}', ${index}, '${opt.color}', '${opt.size}'),\n`;
            code += `        color: "${opt.color}",\n`;
            code += `        size: "${opt.size}",\n`;
            code += `        stock: ${opt.stock},\n`;
            if (opt.imageName) {
                code += `        images: ["/assets/products/${opt.imageName}"]\n`;
            } else {
                code += `        images: []\n`;
            }
            code += `      },\n`;
        });
        code += `    ]\n`;
        code += `  },`;

        setGeneratedCode(code);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="page-container">
            <div className={styles.adminContainer}>
                <h1 className={styles.title}>Product Code Generator</h1>

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
                    <button className={styles.btnPrimary} onClick={generateCode}>Generate Code</button>
                </div>

                {generatedCode && (
                    <div className={styles.outputArea}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <strong>Generated Code (Copy & Paste into products.js):</strong>
                            <button className={styles.btnSecondary} onClick={copyToClipboard} style={{ padding: '5px 10px' }}>
                                Copy {copySuccess && <span className={styles.copySuccess}>{copySuccess}</span>}
                            </button>
                        </div>
                        <pre>{generatedCode}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
