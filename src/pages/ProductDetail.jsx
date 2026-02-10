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
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            const data = await fetchProductById(id);
            if (data) {
                setProduct(data);
                // Initialize selection with first option's color and size
                if (data.options && data.options.length > 0) {
                    const initialColor = data.options[0].color;
                    setSelectedColor(initialColor);

                    // Find first size for this color
                    // Assuming options are already sorted or we just pick the first one matching color
                    // Since data.options[0] matches the color by definition:
                    if (data.options[0].size) {
                        setSelectedSize(data.options[0].size);
                    }

                    // Set initial image
                    if (data.options[0].images && data.options[0].images.length > 0) {
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


    // Derived state for available sizes based on selected color
    const availableSizes = product?.options
        ?.filter(opt => opt.color === selectedColor)
        .map(opt => ({ size: opt.size, stock: opt.stock }))
        .sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true })) || [];

    // All available colors (unique)
    const availableColors = [...new Set(product?.options?.map(opt => opt.color))];

    // Get images for the selected color (or all images if generic?)
    // Strategy: Show images associated with the *selected color* if available, else show all?
    // Implementation: Filter options by selectedColor to get relevant images.
    // If multiple options share the same color (just diff sizes), they usually share images.
    // UPDATE: If exact option (Color + Size) has images, use them first.

    // 1. Precise match (Color + Size - if size selected)
    const exactOption = product?.options?.find(opt => opt.color === selectedColor && opt.size === selectedSize);

    // 2. Color key match (first option with that color - if size not selected or exact match has no images?)
    const colorOption = product?.options?.find(opt => opt.color === selectedColor);

    // Decision tree: Precise with images -> Color with images -> Fallback
    const displayOption = (exactOption?.images?.length > 0) ? exactOption : colorOption;
    const galleryImages = displayOption?.images || product?.options?.[0]?.images || [];

    // Determine SKU to display
    // If size is selected, show that specific option's SKU
    // If only color selected, show that color's first option SKU or just main ID?
    // Let's try to find exact match
    const currentOption = product?.options?.find(opt => opt.color === selectedColor && opt.size === selectedSize);
    // If no exact match (e.g. size not selected), fallback to main SKU or color-based SKU?
    // User wants "Attributes-Option" which changes dynamically.
    // If size not selected, maybe show "HYRGSSHL0001-SV??" or just the Main ID.
    // Let's default to Main ID if no full option selected.
    const currentSKU = currentOption ? currentOption.sku : product.id;

    // Handlers
    const handleColorClick = (color) => {
        setSelectedColor(color);

        // Find available options for the new color and sort by size
        const newOptions = product.options
            .filter(opt => opt.color === color)
            .sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }));

        if (newOptions.length > 0) {
            const firstOption = newOptions[0];
            setSelectedSize(firstOption.size);

            // Update main image to this option's image if available
            if (firstOption.images && firstOption.images.length > 0) {
                setCurrentImage(firstOption.images[0]);
            }
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
    if (language === 'ko') {
        formattedPrice = `${product.price.toLocaleString()} KRW`;
    } else if (language === 'th') {
        formattedPrice = `${product.price_thb ? product.price_thb.toLocaleString() : '0'} THB`;
    } else {
        formattedPrice = `$${product.price_usd || '0.00'}`;
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
                                        // Update main image if the new size has specific images
                                        const option = product.options.find(opt => opt.color === selectedColor && opt.size === size);
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
