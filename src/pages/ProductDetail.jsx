import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../services/productService';
import { useLanguage } from '../context/LanguageContext';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
    const { id } = useParams();
    const { content, language } = useLanguage();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSubColor, setSelectedSubColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            const data = await fetchProductById(id);
            if (data) {
                setProduct(data);
                // Initialize selection
                if (data.options && data.options.length > 0) {
                    const initialColor = data.options[0].color; // Main Color
                    setSelectedColor(initialColor);

                    // Find first sub_color for this color
                    const initialSubColor = data.options.find(opt => opt.color === initialColor)?.sub_color;
                    setSelectedSubColor(initialSubColor);

                    // Find first size for this color + sub_color
                    const initialSizeOption = data.options.find(opt => opt.color === initialColor && opt.sub_color === initialSubColor);
                    if (initialSizeOption?.size) {
                        setSelectedSize(initialSizeOption.size);
                    }

                    // Set initial image
                    if (initialSizeOption?.images?.length > 0) {
                        setCurrentImage(initialSizeOption.images[0]);
                    } else if (data.options[0].images?.length > 0) {
                        setCurrentImage(data.options[0].images[0]);
                    }
                }
            }
            setLoading(false);
        };
        loadProduct();
    }, [id]);

    if (loading) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center' }}>Loading...</div>;
    if (!product) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center' }}>Product not found.</div>;


    // 1. Available Colors (Main)
    const availableColors = [...new Set(product?.options?.map(opt => opt.color))];

    // 2. Available Options (Sub Colors) for selected Color
    const availableSubColors = [...new Set(
        product?.options
            ?.filter(opt => opt.color === selectedColor)
            .map(opt => opt.sub_color)
    )].filter(Boolean); // Remove null/undefined if any

    // 3. Available Sizes for selected Color + Sub Color
    const availableSizes = product?.options
        ?.filter(opt => opt.color === selectedColor && opt.sub_color === selectedSubColor)
        .map(opt => ({ size: opt.size, stock: opt.stock }))
        .sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true })) || [];


    // Image Logic
    // Try to find image for: Exact Option (Color+Sub+Size) -> Option Group (Color+Sub) -> Color Group -> Default
    const exactOption = product?.options?.find(opt => opt.color === selectedColor && opt.sub_color === selectedSubColor && opt.size === selectedSize);
    const subColorOption = product?.options?.find(opt => opt.color === selectedColor && opt.sub_color === selectedSubColor);
    const colorOption = product?.options?.find(opt => opt.color === selectedColor);

    const displayOption =
        (exactOption?.images?.length > 0) ? exactOption :
            (subColorOption?.images?.length > 0) ? subColorOption :
                (colorOption?.images?.length > 0) ? colorOption :
                    product?.options?.[0]; // Fallback to first option explanation

    const galleryImages = displayOption?.images || [];

    // SKU Display
    const currentSKU = exactOption ? exactOption.sku : product.id;

    // Handlers
    const handleColorClick = (color) => {
        if (color === selectedColor) return;
        setSelectedColor(color);

        // Reset SubColor and Size based on new color
        const newOptions = product.options.filter(opt => opt.color === color);
        if (newOptions.length > 0) {
            const nextSubColor = newOptions[0].sub_color;
            setSelectedSubColor(nextSubColor);

            // Filter sizes for new color + new sub color
            const nextSizes = newOptions.filter(opt => opt.sub_color === nextSubColor);
            if (nextSizes.length > 0) {
                setSelectedSize(nextSizes[0].size);

                // Update Image
                const nextOpt = nextSizes[0];
                if (nextOpt.images?.length > 0) setCurrentImage(nextOpt.images[0]);
            } else {
                setSelectedSize(null);
            }
        } else {
            setSelectedSubColor(null);
            setSelectedSize(null);
        }
    };

    const handleSubColorClick = (subColor) => {
        if (subColor === selectedSubColor) return;
        setSelectedSubColor(subColor);

        // Reset Size based on new sub color
        const newOptions = product.options.filter(opt => opt.color === selectedColor && opt.sub_color === subColor);
        if (newOptions.length > 0) {
            const nextSizes = newOptions.sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }));
            setSelectedSize(nextSizes[0].size); // Auto-select first size

            // Update Image
            if (nextSizes[0].images?.length > 0) setCurrentImage(nextSizes[0].images[0]);
        } else {
            setSelectedSize(null);
        }
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert(language === 'ko' ? '사이즈를 선택해주세요.' : 'Please select a size.');
            return;
        }
        alert(language === 'ko' ? '장바구니 기능은 준비 중입니다.' : 'Cart feature coming soon!');
    };



    let formattedPrice;

    // Determine which price to show: Option-specific (if selected) or Product Default
    const displayPriceObj = exactOption || product;

    // Check if exactOption has specific price set (it might be 0/null if legacy data, fall back to product)
    const priceKRW = displayPriceObj.price || product.price;
    const priceTHB = displayPriceObj.price_thb || product.price_thb;
    const priceUSD = displayPriceObj.price_usd || product.price_usd; // Assuming mapped/available

    if (language === 'ko') {
        formattedPrice = `${priceKRW ? priceKRW.toLocaleString() : '0'} KRW`;
    } else if (language === 'th') {
        formattedPrice = `${priceTHB ? priceTHB.toLocaleString() : '0'} THB`;
    } else {
        formattedPrice = `$${priceUSD || '0.00'}`;
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {/* Left: Image Gallery */}
                <div className={styles.gallery}>
                    <div className={styles.mainImageContainer}>
                        {currentImage ? (
                            <img src={currentImage} alt={product.name} className={styles.mainImage} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Image</div>
                        )}
                    </div>
                    {/* Thumbnails */}
                    {galleryImages.length > 1 && (
                        <div className={styles.thumbnailList}>
                            {galleryImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.thumbnail} ${currentImage === img ? styles.active : ''}`}
                                    onClick={() => setCurrentImage(img)}
                                >
                                    <img src={img} alt={`Thumbnail ${idx}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Info */}
                <div className={styles.info}>
                    <div className={styles.category}>{product.category} / {product.material}</div>
                    <h1 className={styles.title}>
                        {product.name}
                    </h1>
                    <div className={styles.skuDisplay}>
                        {currentSKU || product.id}
                    </div>
                    <div className={styles.price}>{formattedPrice}</div>

                    <div className={styles.divider}></div>

                    {/* Color Selection */}
                    <div className={styles.optionGroup}>
                        <label className={styles.optionLabel}>COLOR: {selectedColor}</label>
                        <div className={styles.colorList}>
                            {availableColors.map(color => (
                                <button
                                    key={color}
                                    className={`${styles.colorBtn} ${selectedColor === color ? styles.selected : ''}`}
                                    onClick={() => handleColorClick(color)}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Option (Sub-Color) Selection */}
                    {availableSubColors.length > 0 && (
                        <div className={styles.optionGroup}>
                            <label className={styles.optionLabel}>OPTION: {selectedSubColor}</label>
                            <div className={styles.colorList}> {/* Reusing colorList style for horizontal buttons */}
                                {availableSubColors.map(sub => (
                                    <button
                                        key={sub}
                                        style={{ minWidth: 'auto', padding: '5px 10px' }} // Inline override or add new class
                                        className={`${styles.colorBtn} ${selectedSubColor === sub ? styles.selected : ''}`}
                                        onClick={() => handleSubColorClick(sub)}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection */}
                    <div className={styles.optionGroup}>
                        <label className={styles.optionLabel}>SIZE</label>
                        <div className={styles.sizeList}>
                            {availableSizes.map(({ size, stock }) => (
                                <button
                                    key={size}
                                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.selected : ''}`}
                                    onClick={() => {
                                        setSelectedSize(size);
                                        // Update main image logic
                                        const option = product.options.find(opt => opt.color === selectedColor && opt.sub_color === selectedSubColor && opt.size === size);
                                        if (option?.images?.length > 0) {
                                            setCurrentImage(option.images[0]);
                                        }
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions - Cart Removed */}
                    {/* <div className={styles.actions}>
                        <button
                            className={styles.addToCartBtn}
                            onClick={handleAddToCart}
                            disabled={!selectedSize}
                        >
                            {stockText(language)}
                        </button>
                    </div> */}

                    {/* Details */}
                    <div className={styles.details}>
                        <div className={styles.sectionTitle}>DESCRIPTION</div>
                        <p className={styles.description}>{product.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
