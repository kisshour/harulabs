
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import styles from '../pages/Category.module.css';

const ProductCard = ({ product }) => {
    const { language } = useLanguage();

    // Logic to select the best option and images
    const validOptions = product.options.filter(o => o.price > 0);
    const sortedOptions = validOptions.length > 0 ? validOptions.sort((a, b) => a.price - b.price) : product.options;
    const displayOption = sortedOptions[0];
    const images = displayOption?.images || [];
    const mainImage = images[0];
    const hoverImage = images[1] || images[0]; // Fallback to first if only one

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
            <motion.div
                className={styles.card}
                initial="initial"
                whileHover="hover"
            >
                <div className={styles.imagePlaceholder}>
                    {mainImage ? (
                        <>
                            <img src={mainImage} alt={product.name} className={styles.mainImg} />
                            {images.length > 1 && (
                                <motion.img
                                    src={hoverImage}
                                    alt={`${product.name} alternate`}
                                    className={styles.hoverImg}
                                    variants={{
                                        initial: { opacity: 0 },
                                        hover: { opacity: 1 }
                                    }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                />
                            )}
                        </>
                    ) : (
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
