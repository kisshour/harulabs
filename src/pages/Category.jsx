import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import { useLanguage } from '../context/LanguageContext';
import styles from './Category.module.css';
import Pagination from '../components/Pagination';

const Category = () => {
    const { type } = useParams();
    const { content, language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            const allProducts = await fetchProducts();
            setProducts(allProducts);
            setLoading(false);
        };
        loadProducts();
    }, []);

    // Mapping URL param to CATEGORY codes in products.js if needed, 
    // but products.js uses "RING", "NECKLACE" etc.
    // The URL param will likely be "ring", "necklace".
    // So we match by converting to uppercase.

    // Also handling specific cases if needed, but simple uppercase should work for now.
    const categoryKey = type.toUpperCase();

    const filteredProducts = products.filter(p => p.category === categoryKey);

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const displayedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const categoryTitle = content.ui.nav.categoryList[type] || categoryKey;

    return (
        <div className="page-container" style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <div className="container">
                <h1 className={styles.title}>{categoryTitle}</h1>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>{content.ui.common.comingSoon || "Product preparation in progress."}</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.grid}>
                            {displayedProducts.map(product => (
                                <Link to={`/product/${product.id}`} key={product.id} className={styles.cardLink}>
                                    <div className={styles.card}>
                                        <div className={styles.imagePlaceholder}>
                                            {/* Using the image of the cheapest option if available */}
                                            {(() => {
                                                const validOptions = product.options.filter(o => o.price > 0);
                                                const sortedOptions = validOptions.length > 0 ? validOptions.sort((a, b) => a.price - b.price) : product.options;
                                                const displayOption = sortedOptions[0];
                                                const displayImage = displayOption?.images?.[0];

                                                return displayImage ? (
                                                    <img src={displayImage} alt={product.name} />
                                                ) : (
                                                    <div className={styles.noImage}>No Image</div>
                                                );
                                            })()}
                                        </div>
                                        <div className={styles.info}>
                                            <div className={styles.productName}>{product.name}</div>
                                            <div className={styles.price}>
                                                {(() => {
                                                    const prices = product.options.map(o => o.price).filter(p => p > 0);
                                                    const minPrice = prices.length > 0 ? Math.min(...prices) : product.price;

                                                    const pricesThb = product.options.map(o => o.price_thb).filter(p => p > 0);
                                                    const minPriceThb = pricesThb.length > 0 ? Math.min(...pricesThb) : (product.price_thb || 0);

                                                    const pricesUsd = product.options.map(o => o.price_usd).filter(p => p > 0);
                                                    const minPriceUsd = pricesUsd.length > 0 ? Math.min(...pricesUsd) : (product.price_usd || 0);

                                                    if (language === 'ko') return `${minPrice ? minPrice.toLocaleString() : 0} KRW`;
                                                    if (language === 'th') return `${minPriceThb ? minPriceThb.toLocaleString() : 0} THB`;
                                                    return `$${minPriceUsd || '0.00'}`;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {filteredProducts.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Category;
