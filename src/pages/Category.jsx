import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductContext';
import styles from './Category.module.css';
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard';

const Category = () => {
    const { type } = useParams();
    const { content, language } = useLanguage();
    const { products, loading } = useProducts();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;
    const gridRef = useRef(null);
    const prevTypeRef = useRef(type);

    // Reset page to 1 when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [type]);

    // Scroll to Top of Grid on page change (only if type hasn't changed)
    useEffect(() => {
        if (type !== prevTypeRef.current) {
            prevTypeRef.current = type;
            return; // Skip grid scroll when changing categories
        }

        if (gridRef.current) {
            const headerOffset = 150; // Accounting for sticky header + some breathing room
            const elementPosition = gridRef.current.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, [currentPage, type]);

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
                        <div className={styles.grid} ref={gridRef}>
                            {displayedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
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
