import React from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Collection = () => {
    const { id } = useParams();
    const { content } = useLanguage();
    const collection = content.collections.find(c => c.id === id);

    if (!collection) return <div>Collection not found</div>;

    return (
        <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '20px', textTransform: 'uppercase' }}>{collection.title}</h1>
            <h2 style={{ fontSize: '1.5rem', color: '#888', marginBottom: '40px' }}>{collection.subtitle}</h2>

            <div style={{ padding: '40px', background: '#fafafa', borderRadius: '12px' }}>
                <p style={{ fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '20px' }}>"{collection.catchphrase}"</p>
                <p>{collection.description}</p>
            </div>

            <div style={{ marginTop: '80px', height: '400px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem', color: '#999', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{content.ui.common.comingSoon}</span>
            </div>
        </div>
    );
};

export default Collection;
