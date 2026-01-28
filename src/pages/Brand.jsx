import React from 'react';
import { useLanguage } from '../context/LanguageContext';

import logoColor from '../assets/logo_color.png';

const Brand = () => {
    const { content } = useLanguage();

    return (
        <div className="container" style={{ paddingTop: '150px', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={logoColor} alt="HARU Logo" style={{ width: '120px', marginBottom: '30px' }} />
            <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', textAlign: 'center' }}>{content.brandStory.title}</h1>

            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444' }}>
                {content.brandStory.description.map((paragraph, index) => (
                    <p key={index} style={{ marginBottom: '24px' }}>{paragraph}</p>
                ))}
            </div>
        </div>
    );
};

export default Brand;
