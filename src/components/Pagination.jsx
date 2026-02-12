import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const handlePageClick = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className={styles.pagination}>
            <button
                className={styles.pageBtn}
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={20} />
            </button>

            {pages.map(page => (
                <button
                    key={page}
                    className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                    onClick={() => handlePageClick(page)}
                >
                    {page}
                </button>
            ))}

            <button
                className={styles.pageBtn}
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
