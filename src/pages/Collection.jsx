import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductContext';
import styles from './Category.module.css'; // Reusing grid styles
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard';

const Collection = () => {
    const { id: rawId } = useParams();
    const id = rawId ? rawId.toLowerCase().replace(/\/$/, '') : ''; // Sanitize ID
    const { content, language } = useLanguage();
    const { products, loading } = useProducts();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;
    const gridRef = useRef(null);
    const prevPageRef = useRef(currentPage);

    const collection = content.collections.find(c => c.id.toLowerCase() === id);

    // Reset pagination state when ID changes
    useEffect(() => {
        setCurrentPage(1);
        prevPageRef.current = 1;
    }, [id]);

    // Dedicated Scroll Logic for Pagination
    useEffect(() => {
        if (currentPage !== prevPageRef.current) {
            // Only scroll to grid if THIS is a page change, not an ID change
            if (gridRef.current) {
                const headerOffset = 150;
                const elementPosition = gridRef.current.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
            prevPageRef.current = currentPage;
        }
    }, [currentPage]);

    if (!collection) {
        return (
            <div className="page-container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                <h2>Collection not found: {id}</h2>
                <Link to="/" style={{ color: '#333' }}>Go to Home</Link>
            </div>
        );
    }

    const filteredProducts = products.filter(p =>
        p.theme && p.theme.toUpperCase() === id.toUpperCase()
    );

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

    return (
        <div className="page-container" style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '4rem', marginBottom: '20px', textTransform: 'uppercase', fontFamily: "'Tenada', sans-serif" }}>{collection.title}</h1>
                <h2 style={{ fontSize: '1.5rem', color: '#888', marginBottom: '40px' }}>{collection.subtitle}</h2>

                <div style={{ padding: '40px', background: '#fafafa', borderRadius: '12px', marginBottom: '60px' }}>
                    <p style={{ fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '20px' }}>"{collection.catchphrase}"</p>
                    <p>{collection.description}</p>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer || ''} style={{ textAlign: 'center', padding: '100px' }}>
                        <div className={styles.loader || ''}>Loading...</div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ marginTop: '80px', height: '300px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                        <span style={{ fontSize: '2rem', color: '#999', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            {content.ui.common?.comingSoon || "COMING SOON"}
                        </span>
                    </div>
                ) : (
                    <div className={styles.grid} ref={gridRef}>
                        {displayedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {!loading && filteredProducts.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default Collection;
