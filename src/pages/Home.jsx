import React from 'react';
import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import styles from './Home.module.css';

const Home = () => {
    const { content } = useLanguage();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    return (
        <div>
            <Hero />
            <section className={styles.section}>
                <motion.h2
                    className={styles.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    {content.ui.home.preview}
                </motion.h2>
                <motion.div
                    className={styles.grid}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {content.collections.map((col) => (
                        <motion.div key={col.id} variants={itemVariants}>
                            <Link to={`/collection/${col.id}`}>
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>{col.title}</h3>
                                    <p className={styles.cardSubtitle}>{col.subtitle}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
