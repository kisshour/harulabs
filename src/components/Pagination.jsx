import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const totalNumbers = 13;
        const half = 4; // Numbers around current page (4+1+4 = 9)

        if (totalPages <= totalNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const isLeftDots = currentPage > half + 3;
        const isRightDots = currentPage < totalPages - (half + 2);

        if (!isLeftDots && isRightDots) {
            // Case 1: Early pages
            const leftRange = Array.from({ length: 11 }, (_, i) => i + 1);
            return [...leftRange, '...', totalPages];
        }

        if (isLeftDots && !isRightDots) {
            // Case 2: Late pages
            const rightRange = Array.from({ length: 11 }, (_, i) => totalPages - 10 + i);
            return [1, '...', ...rightRange];
        }

        if (isLeftDots && isRightDots) {
            // Case 3: Middle pages (1 + ... + 9 around current + ... + last = 13)
            const middleRange = Array.from({ length: 9 }, (_, i) => currentPage - 4 + i);
            return [1, '...', ...middleRange, '...', totalPages];
        }

        return Array.from({ length: totalPages }, (_, i) => i + 1);
    };

    const pages = getPageNumbers();

    return (
        <div className={styles.pagination}>
            <button
                className={styles.pageBtn}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={20} />
            </button>

            {pages.map((page, index) => (
                page === '...' ? (
                    <span key={`dots-${index}`} className={styles.dots}>...</span>
                ) : (
                    <button
                        key={page}
                        className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                )
            ))}

            <button
                className={styles.pageBtn}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
