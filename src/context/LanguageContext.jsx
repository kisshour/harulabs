import React, { createContext, useContext, useState } from 'react';
import { CONTENT } from '../data/content';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ko'); // Default to Korean

    const value = {
        language,
        setLanguage,
        content: CONTENT[language]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
