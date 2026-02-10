import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const images = ["/main1.jpeg", "/main2.jpeg?v=2", "/main3.jpeg"];

const Hero = () => {
    const { content } = useLanguage();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        console.log("Current slide index:", index);
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [index]);

    return (
        <div style={{
            height: '100vh',
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#111' // Dark grey fallback
        }}>
            <AnimatePresence mode='popLayout'>
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${images[index]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 0
                    }}
                />
            </AnimatePresence>

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
