import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';
import { Menu, X, Search, User } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
    const { content, language, setLanguage } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null); // 'collections' or 'categories'
    const [isSearchOpen, setIsSearchOpen] = useState(false); // Mobile search toggle
    const [searchQuery, setSearchQuery] = useState('');
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    });

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setActiveDropdown(null); // Reset dropdowns when toggling menu
        if (!isMobileMenuOpen) setIsSearchOpen(false); // Close search when opening menu
    };

    const handleDropdownClick = (e, dropdownName) => {
        // Only for mobile or click-based interaction
        // If window width is small, toggle state
        if (window.innerWidth <= 768) {
            e.preventDefault(); // Prevent navigation if it's a link (though these are spans/divs now)
            e.stopPropagation();
            setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <header
            className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
        >
            <div className={`container ${styles.headerContent}`}>
                <NavLink to="/" className={styles.logoLink} onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); setIsSearchOpen(false); }}>
                    {/* Using text for now as logo might need sizing or specific handling */}
                    <img src={logo} alt="HARU Logo" className={styles.logoImage} />
                </NavLink>

                <nav
                    className={`${styles.desktopNav} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}
                    onMouseEnter={() => setIsSearchOpen(false)}
                >
                    <NavLink to="/" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>{content.ui.nav.home}</NavLink>
                    <NavLink to="/brand" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>{content.ui.nav.brand}</NavLink>

                    <div className={`${styles.dropdown} ${activeDropdown === 'collections' ? styles.active : ''}`}>
                        <span
                            className={styles.dropdownTrigger}
                            onClick={(e) => handleDropdownClick(e, 'collections')}
                        >
                            {content.ui.nav.collections}
                        </span>
                        <div className={styles.dropdownContent}>
                            <NavLink to="/collection/hype" onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>HYPE</NavLink>
                            <NavLink to="/collection/aura" onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>AURA</NavLink>
                            <NavLink to="/collection/rhythm" onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>RHYTHM</NavLink>
                            <NavLink to="/collection/urban" onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>URBAN</NavLink>
                        </div>
                    </div>

                    <div className={`${styles.dropdown} ${activeDropdown === 'categories' ? styles.active : ''}`}>
                        <span
                            className={styles.dropdownTrigger}
                            onClick={(e) => handleDropdownClick(e, 'categories')}
                        >
                            {content.ui.nav.categories}
                        </span>
                        <div className={styles.dropdownContent}>
                            <NavLink to="/category/ring" onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>{content.ui.nav.categoryList.ring}</NavLink>
                            <NavLink to="/category/necklace" onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>{content.ui.nav.categoryList.necklace}</NavLink>
                            <NavLink to="/category/earring" onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>{content.ui.nav.categoryList.earring}</NavLink>
                            <NavLink to="/category/bracelet" onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>{content.ui.nav.categoryList.bracelet}</NavLink>
                            <NavLink to="/category/etc" onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}>{content.ui.nav.categoryList.etc}</NavLink>
                        </div>
                    </div>

                    {/* Mobile Language Selector (Hidden on Desktop) */}
                    <div className={styles.mobileLang} style={{ display: 'flex', gap: '10px', marginTop: '20px', fontSize: '0.9rem', fontWeight: '500', justifyContent: 'center' }}>
                        <span onClick={() => { setLanguage('ko'); setIsMobileMenuOpen(false); if (location.pathname === '/en' || location.pathname === '/th') navigate('/'); }} style={{ cursor: 'pointer', color: language === 'ko' ? '#1A1A1A' : '#999', borderBottom: language === 'ko' ? '1px solid #1A1A1A' : 'none' }}>KR</span>
                        <span style={{ color: '#ccc' }}>|</span>
                        <span onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer', color: language === 'en' ? '#1A1A1A' : '#999', borderBottom: language === 'en' ? '1px solid #1A1A1A' : 'none' }}>EN</span>
                        <span style={{ color: '#ccc' }}>|</span>
                        <span onClick={() => { setLanguage('th'); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer', color: language === 'th' ? '#1A1A1A' : '#999', borderBottom: language === 'th' ? '1px solid #1A1A1A' : 'none' }}>TH</span>
                    </div>
                </nav>

                {/* Desktop Utils (Right) */}
                <div className={styles.utilsSection}>
                    <button className={styles.iconButton} onClick={() => setIsSearchOpen(!isSearchOpen)}>
                        <Search size={20} />
                    </button>
                    <div style={{ width: '1px', height: '14px', background: '#ddd', margin: '0 5px' }}></div>
                    {/* Desktop Language Selector */}
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', fontWeight: '500', alignItems: 'center' }}>
                        <span onClick={() => { setLanguage('ko'); if (location.pathname === '/en' || location.pathname === '/th') navigate('/'); }} style={{ cursor: 'pointer', color: language === 'ko' ? '#1A1A1A' : '#999' }}>KR</span>
                        <span style={{ color: '#eee' }}>|</span>
                        <span onClick={() => setLanguage('en')} style={{ cursor: 'pointer', color: language === 'en' ? '#1A1A1A' : '#999' }}>EN</span>
                        <span style={{ color: '#eee' }}>|</span>
                        <span onClick={() => setLanguage('th')} style={{ cursor: 'pointer', color: language === 'th' ? '#1A1A1A' : '#999' }}>TH</span>
                    </div>
                    {/* <div style={{ width: '1px', height: '14px', background: '#ddd', margin: '0 5px' }}></div>
                    <button className={styles.iconButton} onClick={() => navigate('/login')}>
                        <User size={20} />
                    </button> */}
                </div>

                <div className={styles.mobileIcons}>
                    <button
                        className={`${styles.menuButton} ${isSearchOpen ? styles.active : ''}`}
                        onClick={() => { setIsSearchOpen(!isSearchOpen); setIsMobileMenuOpen(false); }}
                    >
                        <Search size={24} />
                    </button>
                    <button
                        className={`${styles.menuButton} ${isMobileMenuOpen ? styles.active : ''}`}
                        onClick={toggleMenu}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Search Overlay (Mobile & Desktop) */}
            {isSearchOpen && (
                <div className={styles.searchOverlay}>
                    <form onSubmit={handleSearchSubmit} className={styles.searchOverlayForm}>
                        <input
                            type="text"
                            placeholder={content.ui.common?.searchPlaceholder || "Search..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInputOverlay}
                            autoFocus
                        />
                        <button type="submit" className={styles.iconButton} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)' }}>
                            <Search size={20} />
                        </button>
                    </form>
                </div>
            )}
        </header>
    );
};

export default Header;
