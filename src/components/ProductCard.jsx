import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import styles from '../pages/Category.module.css';

const ProductCard = ({ product }) => {
    const { language } = useLanguage();
    const [isHovered, setIsHovered] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // --- SORT ORDERS (Consistent with ProductDetail.jsx) ---
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

    // 1. Sort options by priority: Color -> SubColor -> Size
    const sortedOptions = [...(product.options || [])].sort((a, b) => {
        const colorDiff = sortStrings(a.color, b.color, COLOR_ORDER);
        if (colorDiff !== 0) return colorDiff;

        const subColorDiff = sortStrings(a.sub_color, b.sub_color, SUB_COLOR_ORDER);
        if (subColorDiff !== 0) return subColorDiff;

        return sortSizes(a.size, b.size);
    });

    const displayOption = sortedOptions[0];
    const images = displayOption?.images || [];

    // Auto-looping logic
    useEffect(() => {
        let interval;
        const supportsHover = window.matchMedia('(hover: hover)').matches;

        if (isHovered && images.length > 1 && supportsHover) {
            // Jump to the second image immediately so the user sees a response
            setCurrentImgIndex(1);

            interval = setInterval(() => {
                setCurrentImgIndex((prev) => (prev + 1) % images.length);
            }, 1800); // Back to 1.8s for a relaxed loop
        } else {
            setCurrentImgIndex(0); // Reset to first image when not hovered (or on mobile)
        }
        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    const getPriceDisplay = () => {
        const prices = product.options?.map(o => o.price).filter(p => p > 0) || [];
        const minPrice = prices.length > 0 ? Math.min(...prices) : product.price;

        const pricesThb = product.options?.map(o => o.price_thb).filter(p => p > 0) || [];
        const minPriceThb = pricesThb.length > 0 ? Math.min(...pricesThb) : (product.price_thb || 0);

        const pricesUsd = product.options?.map(o => o.price_usd).filter(p => p > 0) || [];
        const minPriceUsd = pricesUsd.length > 0 ? Math.min(...pricesUsd) : (product.price_usd || 0);

        if (language === 'ko') return `${minPrice ? minPrice.toLocaleString() : 0} KRW`;
        if (language === 'th') return `${minPriceThb ? minPriceThb.toLocaleString() : 0} THB`;
        return `$${minPriceUsd || '0.00'}`;
    };

    return (
        <Link to={`/product/${product.id}`} className={styles.cardLink}>
            <motion.div
                className={styles.card}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ y: -5 }} // Subtle Lift
                transition={{ duration: 0.3 }}
            >
                <div className={styles.imagePlaceholder} style={{ position: 'relative', overflow: 'hidden' }}>
                    {/* Always render the first image as base to avoid "empty" space during transitions */}
                    {images.length > 0 && (
                        <img
                            src={images[0]}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}

                    {/* Overlay for looping images */}
                    <AnimatePresence>
                        {isHovered && images.length > 1 && (
                            <motion.img
                                key={currentImgIndex}
                                src={images[currentImgIndex]}
                                alt={`${product.name} - ${currentImgIndex + 1}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    zIndex: 2,
                                    backgroundColor: '#f5f5f5' // Prevent flash if image loading takes a sec
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {images.length === 0 && (
                        <div className={styles.noImage}>No Image</div>
                    )}
                </div>
                <div className={styles.info}>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.price}>{getPriceDisplay()}</div>
                </div>
            </motion.div>
        </Link>
    );
};

export default ProductCard;
