import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import styles from './Admin.module.css'; // Reusing admin styles for simplicity

const Contact = () => {
    const { content } = useLanguage();
    const { contactPage } = content;

    if (!contactPage) return null;

    return (
        <div className="container" style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
                fontSize: '2rem',
                marginBottom: '10px',
                textAlign: 'center',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '600'
            }}>
                {contactPage.title}
            </h1>
            <p style={{
                fontSize: '1rem',
                color: '#666',
                marginBottom: '60px',
                textAlign: 'center',
                fontFamily: 'Noto Sans KR, sans-serif'
            }}>
                {contactPage.subtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                {contactPage.sections.map((section, index) => (
                    <div key={index}>
                        <h2 style={{
                            fontSize: '1.2rem',
                            marginBottom: '30px',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '15px',
                            fontWeight: '600'
                        }}>
                            {section.title}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {section.items.map((item, idx) => (
                                <div key={idx}>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        marginBottom: '10px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>
                                        {item.label}
                                    </h3>
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontSize: '0.95rem',
                                            lineHeight: '1.6',
                                            color: '#666',
                                            textDecoration: 'none',
                                            display: 'inline-block',
                                            borderBottom: '1px solid transparent',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.borderBottom = '1px solid #666'}
                                        onMouseOut={(e) => e.currentTarget.style.borderBottom = '1px solid transparent'}
                                    >
                                        {item.value}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Contact;
