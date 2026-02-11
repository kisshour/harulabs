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

export const MAIN_COLORS = {
    SILVER: 'SV',
    GOLD: 'GD',
    ROSE_GOLD: 'RG',
    ETC: 'ET'
};

export const SUB_COLORS = {
    'ETC': '00',
    'CRYSTAL': '01',
    'WHITE': '02',
    'BLACK': '03',
    'BEIGE': '04',
    'PINK': '05',
    'BLUE': '06',
    'PURPLE': '07',
    'RED': '08',
    'GREEN': '25',
    'MOTHER_OF_PEARL': '09',
    'ONYX': '10',
    'SAPPHIRE': '11',
    'LAVENDER': '12',
    'JAN_GARNET': '13',
    'FEB_AMETHYST': '14',
    'MAR_AQUAMARINE': '15',
    'APR_DIAMOND': '16',
    'MAY_EMERALD': '17',
    'JUN_PEARL': '18',
    'JUL_RUBY': '19',
    'AUG_PERIDOT': '20',
    'SEP_SAPPHIRE': '21',
    'OCT_OPAL': '22',
    'NOV_TOPAZ': '23',
    'DEC_TURQUOISE': '24'
};

/**
 * Generates a full SKU string
 * @param {string} theme - Key from THEMES (e.g., 'HYPE')
 * @param {string} category - Key from CATEGORIES (e.g., 'RING')
 * @param {string} material - Key from MATERIALS (e.g., 'SURGICAL_STEEL')
 * @param {number} index - Unique number (e.g., 1)
 * @param {string} mainColor - Key from MAIN_COLORS (e.g., 'SILVER')
 * @param {string} subColor - Key from SUB_COLORS (e.g., '크리스탈')
 * @param {string|number} size - Size value (e.g., '12' or 'FR')
 */
export const generateSKU = (theme, category, material, index, mainColor, subColor, size) => {
    const themeCode = THEMES[theme] || 'XX';
    const categoryCode = CATEGORIES[category] || 'XX';
    const materialCode = MATERIALS[material] || 'XX';

    // Format index to 4 digits (e.g., 1 -> '0001')
    const indexCode = String(index).padStart(4, '0');

    const mainColorCode = MAIN_COLORS[mainColor] || 'XX';
    const subColorCode = SUB_COLORS[subColor] || '00';
    const sizeCode = String(size).toUpperCase();

    return `${themeCode}${categoryCode}${materialCode}${indexCode}-${mainColorCode}${subColorCode}${sizeCode}`;
};
