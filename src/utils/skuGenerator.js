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
    '기타': '00',
    '크리스탈': '01',
    '화이트': '02',
    '블랙': '03',
    '베이지': '04',
    '핑크': '05',
    '블루': '06',
    '퍼플': '07',
    '레드': '08',
    '자개': '09',
    '오닉스': '10',
    '사파이어': '11',
    '라벤더': '12',
    '1월 가넷': '13',
    '2월 자수정': '14',
    '3월 아쿠아': '15',
    '4월 다이아': '16',
    '5월 에메랄드': '17',
    '6월 진주': '18',
    '7월 루비': '19',
    '8월 페리도트': '20',
    '9월 사파이어': '21',
    '10월 오팔': '22',
    '11월 토파즈': '23',
    '12월 터키석': '24'
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
