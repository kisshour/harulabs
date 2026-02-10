import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import styles from './Admin.module.css'; // Reusing admin styles for simplicity
import logoColor from '../assets/logo_color.png'; // Reusing logo from Brand page if available

const Contact = () => {
    const { content } = useLanguage();
    const { contactPage } = content;

    if (!contactPage) return null;

    return (
        <div className="container" style={{ padding: '120px 20px 60px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            {/* Logo or specialized header */}
            <h1 style={{
                fontSize: '2.5rem',
                marginBottom: '10px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '600'
            }}>
                {contactPage.title}
            </h1>
            <p style={{
                fontSize: '1.2rem',
                color: '#666',
                marginBottom: '60px',
                fontFamily: 'Noto Sans KR, sans-serif'
            }}>
                {contactPage.subtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
                {contactPage.sections.map((section, index) => (
                    <div key={index} style={{ width: '100%' }}>
                        <h2 style={{
                            fontSize: '1.3rem',
                            marginBottom: '20px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            {section.title}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {section.items.map((item, idx) => (
                                <a
                                    key={idx}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        padding: '15px',
                                        border: '1px solid #eee',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: '#333',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: '#fff'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f9f9f9';
                                        e.currentTarget.style.borderColor = '#ddd';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fff';
                                        e.currentTarget.style.borderColor = '#eee';
                                    }}
                                >
                                    <span style={{ fontWeight: '600', minWidth: '80px', textAlign: 'right' }}>{item.label}</span>
                                    <span style={{ color: '#ccc' }}>|</span>
                                    <span style={{ color: '#555' }}>{item.value}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Contact;
