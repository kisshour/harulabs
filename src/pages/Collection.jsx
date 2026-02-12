import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchProducts } from '../services/productService';
import styles from './Category.module.css'; // Reusing grid styles
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard';

const Collection = () => {
    const { id } = useParams();
    const { content, language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const collection = content.collections.find(c => c.id === id);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            const allProducts = await fetchProducts();
            setProducts(allProducts);
            setLoading(false);
        };
        loadProducts();
    }, []);

    // Reset page to 1 when collection changes
    useEffect(() => {
        setCurrentPage(1);
    }, [id]);

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    if (!collection) return <div>Collection not found</div>;

    const filteredProducts = products.filter(p => p.theme === id.toUpperCase());

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
                    <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ marginTop: '80px', height: '300px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                        <span style={{ fontSize: '2rem', color: '#999', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{content.ui.common.comingSoon}</span>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {displayedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
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
