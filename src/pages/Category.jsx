
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import styles from './Category.module.css';

const Category = () => {
    const { type } = useParams();
    const { content } = useLanguage();

    // Mapping URL param to CATEGORY codes in products.js if needed, 
    // but products.js uses "RING", "NECKLACE" etc.
    // The URL param will likely be "ring", "necklace".
    // So we match by converting to uppercase.

    // Also handling specific cases if needed, but simple uppercase should work for now.
    const categoryKey = type.toUpperCase();

    const filteredProducts = PRODUCTS.filter(p => p.category === categoryKey);

    const categoryTitle = content.ui.nav.categoryList[type] || categoryKey;

    return (
        <div className="page-container" style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <div className="container">
                <h1 className={styles.title}>{categoryTitle}</h1>

                {filteredProducts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>{content.ui.common.comingSoon || "Product preparation in progress."}</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredProducts.map(product => (
                            <div key={product.id} className={styles.card}>
                                <div className={styles.imagePlaceholder}>
                                    {/* Using the first option's image if available, else placeholder */}
                                    {product.options[0]?.images?.[0] ? (
                                        <img src={product.options[0].images[0]} alt={product.name} />
                                    ) : (
                                        <div className={styles.noImage}>No Image</div>
                                    )}
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.productName}>{product.name}</div>
                                    <div className={styles.price}>{product.price.toLocaleString()} KRW</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Category;
