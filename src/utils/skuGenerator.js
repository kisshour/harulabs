/**
 * Product SKU Generator
 * Format: [THEME][CATEGORY][MATERIAL]-[INDEX][COLOR][SIZE]
 * Example: HYRGSS-0001SV12
 */

export const THEMES = {
    HYPE: 'HY',
    AURA: 'AU',
    RHYTHM: 'RH',
    URBAN: 'UR'
};

export const CATEGORIES = {
    RING: 'RG',
    NECKLACE: 'NK',
    EARRING: 'ER',
    BRACELET: 'BR',
    ETC: 'ET'
};

export const MATERIALS = {
    SURGICAL_STEEL: 'SS',
    SILVER: 'SV',
    GOLD: 'GD',
    BRASS: 'BR',
    OTHER: 'OT'
};

export const COLORS = {
    SILVER: 'SV',
    GOLD: 'GD',
    ROSE_GOLD: 'RG',
    BLACK: 'BK',
    WHITE: 'WT',
    PINK: 'PK',
    ETC: 'ET'
};

/**
 * Generates a full SKU string
 * @param {string} theme - Key from THEMES (e.g., 'HYPE')
 * @param {string} category - Key from CATEGORIES (e.g., 'RING')
 * @param {string} material - Key from MATERIALS (e.g., 'SURGICAL_STEEL')
 * @param {number} index - Unique number (e.g., 1)
 * @param {string} color - Key from COLORS (e.g., 'SILVER')
 * @param {string|number} size - Size value (e.g., '12' or 'FR')
 */
export const generateSKU = (theme, category, material, index, color, size) => {
    const themeCode = THEMES[theme] || 'XX';
    const categoryCode = CATEGORIES[category] || 'XX';
    const materialCode = MATERIALS[material] || 'XX';

    // Format index to 4 digits (e.g., 1 -> '0001')
    const indexCode = String(index).padStart(4, '0');

    const colorCode = COLORS[color] || 'XX';
    const sizeCode = String(size).toUpperCase();

    return `${themeCode}${categoryCode}${materialCode}-${indexCode}${colorCode}${sizeCode}`;
};
