import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductContext';
import styles from './Category.module.css'; // Reusing Category styles for grid
import ProductCard from '../components/ProductCard';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { content } = useLanguage();
    const { products, loading } = useProducts();

    const lowerQuery = query.toLowerCase();
    const filteredProducts = products.filter(p => {
        if (!query) return false;
        return (
            p.name.toLowerCase().includes(lowerQuery) ||
            p.id.toLowerCase().includes(lowerQuery) ||
            (p.theme && p.theme.toLowerCase().includes(lowerQuery)) ||
            (p.category && p.category.toLowerCase().includes(lowerQuery)) ||
            (p.description && p.description.toLowerCase().includes(lowerQuery))
        );
    });

    return (
        <div className="page-container" style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <div className="container">
                <h1 className={styles.title}>
                    {content.ui.common?.searchResults || "Search Results"}: "{query}"
                </h1>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>{content.ui.common?.noResults || "No products found."}</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
