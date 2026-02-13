import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import styles from './Hero.module.css';

const images = ["/main1.jpeg", "/main2.jpeg?v=2", "/main3.jpeg"];

const Hero = () => {
    const { content } = useLanguage();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [index]);

    return (
        <div className={styles.heroContainer}>
            <AnimatePresence mode='popLayout'>
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        opacity: { duration: 1.5 },
                        scale: { duration: 6, ease: "linear" }
                    }}
                    className={styles.slide}
                    style={{
                        backgroundImage: `url(${images[index]})`,
                    }}
                />
            </AnimatePresence>

            <div className={`container ${styles.contentOverlay}`}>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={styles.subtitle}
                >
                    {content.brandStory.subtitle}
                </motion.p>
            </div>
        </div>
    );
};

export default Hero;
