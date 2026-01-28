import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import heroBg from '../assets/package.png';

const Hero = () => {
    const { content } = useLanguage();

    return (
        <div style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Overlay removed */}

            <div className="container" style={{
                textAlign: 'center',
                zIndex: 1,
                position: 'absolute',
                bottom: '100px',
                left: '0',
                right: '0'
            }}>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        fontSize: '1.5rem',
                        color: '#fff',
                        letterSpacing: '0.1em',
                        fontWeight: '500',
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}
                >
                    {content.brandStory.subtitle}
                </motion.p>
            </div>
        </div>
    );
};

export default Hero;
