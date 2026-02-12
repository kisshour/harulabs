import { generateSKU } from "../utils/skuGenerator.js";

export const PRODUCTS = [
    {
        id: generateSKU('HYPE', 'RING', 'SURGICAL_STEEL', 1, 'SILVER', 'CRYSTAL', 12),
        name: "Classic Hype Ring",
        theme: "HYPE",
        category: "RING",
        price: 45000,
        description: "A bold statement piece reflecting the energy of the HYPE collection.",
        material: "SURGICAL_STEEL",
        options: [
            {
                sku: generateSKU('HYPE', 'RING', 'SURGICAL_STEEL', 1, 'SILVER', 'CRYSTAL', 12),
                color: "SILVER",
                sub_color: "CRYSTAL",
                size: "12",
                stock: 10,
                images: ["/assets/products/hype-ring-1.jpg"] // Placeholder
            },
            {
                sku: generateSKU('HYPE', 'RING', 'SURGICAL_STEEL', 1, 'SILVER', 'CRYSTAL', 14),
                color: "SILVER",
                sub_color: "CRYSTAL",
                size: "14",
                stock: 5,
                images: ["/assets/products/hype-ring-1.jpg"]
            }
        ]
    },
    {
        id: generateSKU('AURA', 'NECKLACE', 'SILVER', 2, 'GOLD', 'ETC', 'FR'),
        name: "Aura Essence Necklace",
        theme: "AURA",
        category: "NECKLACE",
        price: 89000,
        description: "Elegant and subtle, the Aura Essence Necklace captures inner light.",
        material: "SILVER",
        options: [
            {
                sku: generateSKU('AURA', 'NECKLACE', 'SILVER', 2, 'GOLD', 'ETC', 'FR'),
                color: "GOLD",
                sub_color: "ETC",
                size: "FR", // Free size
                stock: 15,
                images: ["/assets/products/aura-necklace-1.jpg"]
            }
        ]
    },
    {
        id: generateSKU('RHYTHM', 'BRACELET', 'GOLD', 3, 'ROSEGOLD', 'ETC', 'FR'),
        name: "Rhythm Flow Bracelet",
        theme: "RHYTHM",
        category: "BRACELET",
        price: 120000,
        description: "Inspired by the flow of music, this bracelet adds a rhythmic touch to your style.",
        material: "GOLD",
        options: [
            {
                sku: generateSKU('RHYTHM', 'BRACELET', 'GOLD', 3, 'ROSEGOLD', 'ETC', 'FR'),
                color: "ROSEGOLD",
                sub_color: "ETC",
                size: "FR",
                stock: 8,
                images: ["/assets/products/rhythm-bracelet-1.jpg"]
            }
        ]
    },
    {
        id: generateSKU('URBAN', 'EARRING', 'SURGICAL_STEEL', 4, 'BLACK', 'ONYX', 'FR'),
        name: "Urban Edge Earrings",
        theme: "URBAN",
        category: "EARRING",
        price: 35000,
        description: "Modern and chic, perfect for the urban explorer.",
        material: "SURGICAL_STEEL",
        options: [
            {
                sku: generateSKU('URBAN', 'EARRING', 'SURGICAL_STEEL', 4, 'BLACK', 'ONYX', 'FR'),
                color: "BLACK",
                sub_color: "ONYX",
                size: "FR",
                stock: 20,
                images: ["/assets/products/urban-earring-1.jpg"]
            }
        ]
    }
];

// Helper to find a product by ID (generic or specific SKU)
export const getProductById = (id) => {
    return PRODUCTS.find(p => p.id === id || p.options.some(opt => opt.sku === id));
};
