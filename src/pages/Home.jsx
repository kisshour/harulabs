import React from 'react';
import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import styles from './Home.module.css';

const Home = () => {
    const { content } = useLanguage();

    return (
        <div>
            <Hero />
            <section className={styles.section}>
                <h2 className={styles.title}>{content.ui.home.preview}</h2>
                <div className={styles.grid}>
                    {content.collections.map((col) => (
                        <Link key={col.id} to={`/collection/${col.id}`}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className={styles.card}
                            >
                                <h3 className={styles.cardTitle}>{col.title}</h3>
                                <p className={styles.cardSubtitle}>{col.subtitle}</p>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
