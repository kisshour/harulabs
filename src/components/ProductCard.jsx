import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import styles from '../pages/Category.module.css';

const ProductCard = ({ product }) => {
    const { language } = useLanguage();
    const [isHovered, setIsHovered] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // Logic to select the best option and images
    const validOptions = product.options.filter(o => o.price > 0);
    const sortedOptions = validOptions.length > 0 ? validOptions.sort((a, b) => a.price - b.price) : product.options;
    const displayOption = sortedOptions[0];
    const images = displayOption?.images || [];

    // Auto-looping logic
    useEffect(() => {
        let interval;
        if (isHovered && images.length > 1) {
            interval = setInterval(() => {
                setCurrentImgIndex((prev) => (prev + 1) % images.length);
            }, 1800); // 1.8s for a premium, steady pace
        } else {
            setCurrentImgIndex(0); // Reset to first image when not hovered
        }
        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    const getPriceDisplay = () => {
        const prices = product.options.map(o => o.price).filter(p => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : product.price;

        const pricesThb = product.options.map(o => o.price_thb).filter(p => p > 0);
        const minPriceThb = pricesThb.length > 0 ? Math.min(...pricesThb) : (product.price_thb || 0);

        const pricesUsd = product.options.map(o => o.price_usd).filter(p => p > 0);
        const minPriceUsd = pricesUsd.length > 0 ? Math.min(...pricesUsd) : (product.price_usd || 0);

        if (language === 'ko') return `${minPrice ? minPrice.toLocaleString() : 0} KRW`;
        if (language === 'th') return `${minPriceThb ? minPriceThb.toLocaleString() : 0} THB`;
        return `$${minPriceUsd || '0.00'}`;
    };

    return (
        <Link to={`/product/${product.id}`} className={styles.cardLink}>
            <div
                className={styles.card}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={styles.imagePlaceholder}>
                    <AnimatePresence mode="wait">
                        {images.length > 0 ? (
                            <motion.img
                                key={currentImgIndex}
                                src={images[currentImgIndex]}
                                alt={`${product.name} - ${currentImgIndex + 1}`}
                                className={styles.mainImg}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className={styles.noImage}>No Image</div>
                        )}
                    </AnimatePresence>
                </div>
                <div className={styles.info}>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.price}>{getPriceDisplay()}</div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
