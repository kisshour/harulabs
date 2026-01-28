import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import logoColor from '../assets/logo_color.png';
import styles from './Brand.module.css';

const Brand = () => {
    const { content } = useLanguage();

    return (
        <div className={`container ${styles.brandContainer}`}>
            <img src={logoColor} alt="HARU Logo" className={styles.logoImage} />
            <h1 className={styles.title}>{content.brandStory.title}</h1>

            <div className={styles.description}>
                {content.brandStory.description.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
        </div>
    );
};

export default Brand;
