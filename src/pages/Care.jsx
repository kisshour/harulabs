import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import styles from './Admin.module.css'; // Reusing admin styles for simplicity or create new one

const Care = () => {
    const { content } = useLanguage();
    const { careGuide } = content;

    if (!careGuide) return null;

    return (
        <div className="container" style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
                fontSize: '2rem',
                marginBottom: '60px',
                textAlign: 'center',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '600'
            }}>
                {careGuide.title}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                {careGuide.sections.map((section, index) => (
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
                                        {item.subtitle}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        color: '#666',
                                        whiteSpace: 'pre-line'
                                    }}>
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Care;
