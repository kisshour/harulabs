import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../services/productService';
import { useLanguage } from '../context/LanguageContext';
import styles from './ProductDetail.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const { content, language } = useLanguage();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSubColor, setSelectedSubColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);

    // --- SORT ORDERS (Repeated for use in useEffect and render) ---
    const COLOR_ORDER = ['SILVER', 'GOLD', 'ROSEGOLD', 'ETC'];
    const SIZE_ORDER_PREF = 'FR';
    const SUB_COLOR_ORDER = ['ETC', 'CRYSTAL', 'WHITE', 'BLACK', 'BEIGE', 'PINK', 'BLUE', 'PURPLE', 'RED', 'GREEN'];

    const sortStrings = (a, b, order) => {
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    };

    const sortSizes = (a, b) => {
        if (a === SIZE_ORDER_PREF) return -1;
        if (b === SIZE_ORDER_PREF) return 1;
        return a.localeCompare(b, undefined, { numeric: true });
    };

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            const data = await fetchProductById(id);
            if (data && data.options && data.options.length > 0) {
                setProduct(data);

                // 1. Get Sorted Available Colors
                const availableColors = [...new Set(data.options.map(opt => opt.color))]
                    .sort((a, b) => sortStrings(a, b, COLOR_ORDER));

                const initialColor = availableColors[0];
                setSelectedColor(initialColor);

                // 2. Get Sorted Sub-colors for that Color
                const availableSubs = [...new Set(
                    data.options
                        .filter(opt => opt.color === initialColor)
                        .map(opt => opt.sub_color)
                )].filter(Boolean).sort((a, b) => sortStrings(a, b, SUB_COLOR_ORDER));

                const initialSub = availableSubs[0];
                setSelectedSubColor(initialSub);

                // 3. Get Sorted Sizes for that Color + Sub
                const availableSizes = data.options
                    .filter(opt => opt.color === initialColor && opt.sub_color === initialSub)
                    .sort((a, b) => sortSizes(a.size, b.size));

                if (availableSizes.length > 0) {
                    setSelectedSize(availableSizes[0].size);

                    // Set initial image
                    if (availableSizes[0].images?.length > 0) {
                        setCurrentImage(availableSizes[0].images[0]);
                    }
                }
            } else if (data) {
                setProduct(data);
            }
            setLoading(false);
        };
        loadProduct();
    }, [id]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
            </div>
        );
    }

    if (!product) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center' }}>Product not found.</div>;


    // 1. Available Colors (Main) - Sorted
    const availableColors = [...new Set(product?.options?.map(opt => opt.color))]
        .sort((a, b) => sortStrings(a, b, COLOR_ORDER));

    // 2. Available Options (Sub Colors) for selected Color - Sorted
    const availableSubColors = [...new Set(
        product?.options
            ?.filter(opt => opt.color === selectedColor)
            .map(opt => opt.sub_color)
    )].filter(Boolean).sort((a, b) => sortStrings(a, b, SUB_COLOR_ORDER));

    // 3. Available Sizes for selected Color + Sub Color - Sorted
    const availableSizes = product?.options
        ?.filter(opt => opt.color === selectedColor && opt.sub_color === selectedSubColor)
        .map(opt => ({ size: opt.size, stock: opt.stock }))
        .sort((a, b) => sortSizes(a.size, b.size)) || [];


    // Image Logic
    // Try to find image for: Exact Option (Color+Sub+Size) -> Option Group (Color+Sub) -> Color Group -> Default
    const exactOption = product?.options?.find(opt => opt.color === selectedColor && opt.sub_color === selectedSubColor && opt.size === selectedSize);
    const subColorOption = product?.options?.find(opt => opt.color === selectedColor && opt.sub_color === selectedSubColor);
    const colorOption = product?.options?.find(opt => opt.color === selectedColor);

    const displayOption =
        (exactOption?.images?.length > 0) ? exactOption :
            (subColorOption?.images?.length > 0) ? subColorOption :
                (colorOption?.images?.length > 0) ? colorOption :
                    product?.options?.[0]; // Fallback to first option

    const galleryImages = displayOption?.images || [];

    const handleNextImage = () => {
        const currentIndex = galleryImages.indexOf(currentImage);
        const nextIndex = (currentIndex + 1) % galleryImages.length;
        setCurrentImage(galleryImages[nextIndex]);
    };

    const handlePrevImage = () => {
        const currentIndex = galleryImages.indexOf(currentImage);
        const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        setCurrentImage(galleryImages[prevIndex]);
    };

    // SKU Display
    const currentSKU = exactOption ? exactOption.sku : product.id;

    // Handlers
    const handleColorClick = (color) => {
        if (color === selectedColor) return;
        setSelectedColor(color);

        // PERSISTENCE LOGIC
        const newOptions = product.options.filter(opt => opt.color === color);

        // 1. Try to keep current SubColor
        let nextSubColor = selectedSubColor;
        const subExists = newOptions.some(opt => opt.sub_color === selectedSubColor);

        if (!subExists) {
            // Fallback to first available sub-color (sorted)
            const sortedSubByColor = [...new Set(newOptions.map(opt => opt.sub_color))]
                .sort((a, b) => sortStrings(a, b, SUB_COLOR_ORDER));
            nextSubColor = sortedSubByColor[0];
        }
        setSelectedSubColor(nextSubColor);

        // 2. Try to keep current Size
        const sizesForNewSub = newOptions.filter(opt => opt.sub_color === nextSubColor);
        const sizeExists = sizesForNewSub.some(opt => opt.size === selectedSize);

        if (sizeExists) {
            // Keep current size
            // Update Image if available for this specific path
            const opt = sizesForNewSub.find(o => o.size === selectedSize);
            if (opt?.images?.length > 0) setCurrentImage(opt.images[0]);
        } else {
            // Fallback to first available size (sorted)
            const sortedSizes = sizesForNewSub.sort((a, b) => sortSizes(a.size, b.size));
            if (sortedSizes.length > 0) {
                setSelectedSize(sortedSizes[0].size);
                if (sortedSizes[0].images?.length > 0) setCurrentImage(sortedSizes[0].images[0]);
            } else {
                setSelectedSize(null);
            }
        }
    };

    const handleSubColorClick = (subColor) => {
        if (subColor === selectedSubColor) return;
        setSelectedSubColor(subColor);

        // PERSISTENCE LOGIC
        const sizesForNewSub = product.options.filter(opt => opt.color === selectedColor && opt.sub_color === subColor);
        const sizeExists = sizesForNewSub.some(opt => opt.size === selectedSize);

        if (sizeExists) {
            // Keep current size
            const opt = sizesForNewSub.find(o => o.size === selectedSize);
            if (opt?.images?.length > 0) setCurrentImage(opt.images[0]);
        } else {
            // Fallback to first available size (sorted)
            const sortedSizes = sizesForNewSub.sort((a, b) => sortSizes(a.size, b.size));
            if (sortedSizes.length > 0) {
                setSelectedSize(sortedSizes[0].size);
                if (sortedSizes[0].images?.length > 0) setCurrentImage(sortedSizes[0].images[0]);
            } else {
                setSelectedSize(null);
            }
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
                            <>
                                <img src={currentImage} alt={product.name} className={styles.mainImage} />
                                {galleryImages.length > 1 && (
                                    <>
                                        <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={handlePrevImage}>
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={handleNextImage}>
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </>
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
                    <div className={styles.infoTop}>
                        <div className={styles.category}>{product.theme} COLLECTION</div>
                        <h1 className={styles.title}>
                            {product.name}
                        </h1>
                        <div className={styles.skuDisplay}>
                            {currentSKU || product.id}
                        </div>
                        <div className={styles.price}>{formattedPrice}</div>
                    </div>

                    <div className={styles.infoBottom}>
                        <div className={styles.divider}></div>

                        {/* Color Selection */}
                        <div className={styles.optionGroup}>
                            <label className={styles.optionLabel}>COLOR: {selectedColor?.toUpperCase()}</label>
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
                                <label className={styles.optionLabel}>OPTION: {selectedSubColor?.toUpperCase()}</label>
                                <div className={styles.colorList}> {/* Reusing colorList style for horizontal buttons */}
                                    {availableSubColors.map(sub => (
                                        <button
                                            key={sub}
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
        </div>
    );
};

export default ProductDetail;
