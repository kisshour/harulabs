import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';
import { Menu, X } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
    const { content, language, setLanguage } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    });

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <motion.header
            className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className={`container ${styles.headerContent}`}>
                <NavLink to="/" className={styles.logoLink}>
                    {/* Using text for now as logo might need sizing or specific handling */}
                    <img src={logo} alt="HARU Logo" className={styles.logoImage} />
                </NavLink>

                <nav className={`${styles.desktopNav} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
                    <NavLink to="/" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={() => setIsMobileMenuOpen(false)}>{content.ui.nav.home}</NavLink>
                    <NavLink to="/brand" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={() => setIsMobileMenuOpen(false)}>{content.ui.nav.brand}</NavLink>
                    <div className={styles.dropdown}>
                        <span className={styles.dropdownTrigger}>{content.ui.nav.collections}</span>
                        <div className={styles.dropdownContent}>
                            <NavLink to="/collection/hype" onClick={() => setIsMobileMenuOpen(false)}>HYPE</NavLink>
                            <NavLink to="/collection/aura" onClick={() => setIsMobileMenuOpen(false)}>AURA</NavLink>
                            <NavLink to="/collection/rhythm" onClick={() => setIsMobileMenuOpen(false)}>RHYTHM</NavLink>
                            <NavLink to="/collection/urban" onClick={() => setIsMobileMenuOpen(false)}>URBAN</NavLink>
                        </div>
                    </div>

                    {/* Language Selector */}
                    <div style={{ display: 'flex', gap: '10px', marginLeft: '20px', fontSize: '0.8rem', fontWeight: '500' }}>
                        <span
                            onClick={() => { setLanguage('ko'); setIsMobileMenuOpen(false); }}
                            style={{
                                cursor: 'pointer',
                                color: language === 'ko' ? '#1A1A1A' : '#999',
                                borderBottom: language === 'ko' ? '1px solid #1A1A1A' : 'none'
                            }}
                        >
                            KO
                        </span>
                        <span style={{ color: '#ccc' }}>|</span>
                        <span
                            onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }}
                            style={{
                                cursor: 'pointer',
                                color: language === 'en' ? '#1A1A1A' : '#999',
                                borderBottom: language === 'en' ? '1px solid #1A1A1A' : 'none'
                            }}
                        >
                            EN
                        </span>
                    </div>
                </nav>

                <button className={styles.menuButton} onClick={toggleMenu}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </motion.header>
    );
};

export default Header;
