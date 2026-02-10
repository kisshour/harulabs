import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import styles from './Header.module.css';

const Footer = () => {
    const { content, language, setLanguage } = useLanguage();
    return (
        <footer style={{
            backgroundColor: '#f9f9f9',
            padding: '60px 20px',
            marginTop: 'auto',
            borderTop: '1px solid #eee'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                flexWrap: 'wrap',
                gap: '40px'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>HARU</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem', maxWidth: '300px' }}>
                        {content.ui.footer.slogan}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '60px' }}>
                    <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{content.ui.footer.collections}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <NavLink to="/collection/hype" style={{ color: '#666', fontSize: '0.9rem' }}>HYPE</NavLink>
                            <NavLink to="/collection/aura" style={{ color: '#666', fontSize: '0.9rem' }}>AURA</NavLink>
                            <NavLink to="/collection/rhythm" style={{ color: '#666', fontSize: '0.9rem' }}>RHYTHM</NavLink>
                            <NavLink to="/collection/urban" style={{ color: '#666', fontSize: '0.9rem' }}>URBAN</NavLink>
                        </div>
                    </div>
                    <div>
                        <div>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{content.ui.footer.brand}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <NavLink to="/brand" style={{ color: '#666', fontSize: '0.9rem' }}>{content.ui.footer.about}</NavLink>
                                <NavLink to="/care" style={{ color: '#666', fontSize: '0.9rem' }}>{content.ui.footer.care}</NavLink>
                                <NavLink to="/contact" style={{ color: '#666', fontSize: '0.9rem' }}>{content.ui.footer.contact}</NavLink>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #eee', color: '#aaa', fontSize: '0.8rem', textAlign: 'center' }}>
                <p style={{ marginBottom: '5px' }}>{content.ui.footer.copyright}</p>
                {content.ui.footer.businessInfo && (
                    <p>
                        {content.ui.footer.businessInfo.registration} <br className="mobile-break" />
                        <span style={{ margin: '0 10px', display: 'inline-block' }} className="desktop-separator">|</span>
                        {content.ui.footer.businessInfo.info}
                    </p>
                )}
            </div>
        </footer>
    );
};

export default Footer;
