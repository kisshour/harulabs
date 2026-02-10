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
                // Initialize selection with first option's color
                if (data.options && data.options.length > 0) {
                    const initialColor = data.options[0].color;
                    setSelectedColor(initialColor);

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
    const currentColorOption = product?.options?.find(opt => opt.color === selectedColor);
    const galleryImages = currentColorOption?.images || product?.options?.[0]?.images || [];

    // Handlers
    const handleColorClick = (color) => {
        setSelectedColor(color);
        setSelectedSize(null); // Reset size when color changes

        // Update main image to first image of this color
        const newColorOption = product.options.find(opt => opt.color === color);
        if (newColorOption && newColorOption.images && newColorOption.images.length > 0) {
            setCurrentImage(newColorOption.images[0]);
        }
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert(language === 'ko' ? '사이즈를 선택해주세요.' : 'Please select a size.');
            return;
        }
        alert(language === 'ko' ? '장바구니 기능은 준비 중입니다.' : 'Cart feature coming soon!');
    };

    if (loading) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center' }}>Loading...</div>;
    if (!product) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center' }}>Product not found.</div>;

    const formattedPrice = language === 'ko' || content.ui.common.currency === 'KRW'
        ? `${product.price.toLocaleString()} KRW`
        : `$${product.price_usd || '0.00'}`;

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
                    <h1 className={styles.title}>{product.name}</h1>
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
                                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.selected : ''} ${stock <= 0 ? styles.outOfStock : ''}`}
                                    onClick={() => stock > 0 && setSelectedSize(size)}
                                    disabled={stock <= 0}
                                    title={stock <= 0 ? 'Out of Stock' : ''}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button
                            className={styles.addToCartBtn}
                            onClick={handleAddToCart}
                            disabled={!selectedSize}
                        >
                            {stockText(language)}
                        </button>
                    </div>

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

const stockText = (lang) => lang === 'ko' ? '장바구니 담기' : 'ADD TO CART';

export default ProductDetail;
