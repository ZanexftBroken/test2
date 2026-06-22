import { Product } from './types';

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'sb_001',
    name: 'Air Jordan 1 Retro High "Chicago Reimagined"',
    brand: 'Jordan',
    size: 10.5,
    condition: 'Like New',
    price: 380000,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'
    ],
    description: 'Iconic Chicago high top silhouette in an authenticated pre-loved condition. Crisp leather, minor creasing on the toe-box, includes original lace pack and collectible vintage box wrap.',
    stock: 1,
    createdAt: 1718910000000
  },
  {
    id: 'sb_002',
    name: 'New Balance 550 "White Green Retro"',
    brand: 'New Balance',
    size: 9.5,
    condition: 'Excellent',
    price: 185000,
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'
    ],
    description: 'Throwback basketball model in clean pine green accents. Expertly restored leather, fully steam-sanitized, custom premium insoles. Fits true to size.',
    stock: 2,
    createdAt: 1718911000000
  },
  {
    id: 'sb_003',
    name: 'Nike Dunk Low "Panda Classic"',
    brand: 'Nike',
    size: 10,
    condition: 'Good',
    price: 145000,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'
    ],
    description: 'The street essential colorway. Authentic checking approved, minor sole stars wear, professionally crep-protected. Cleaned and deodorized with active charcoal.',
    stock: 5,
    createdAt: 1718912000000
  },
  {
    id: 'sb_004',
    name: 'Yeezy Boost 350 V2 "Zebra Grail"',
    brand: 'Adidas',
    size: 11,
    condition: 'Excellent',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80'
    ],
    description: 'Original primeknit boost trainer in classic zebra patterning. Upper holds structure perfectly, Boost sole has very minor yellowing. Fully authenticated pull-tabs and laces.',
    stock: 1,
    createdAt: 1718913000000
  },
  {
    id: 'sb_005',
    name: 'Asics Gel-Kayano 14 "Cream Black Metallic"',
    brand: 'Asics',
    size: 9,
    condition: 'Like New',
    price: 245000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'
    ],
    description: 'High-comfort retro-runner silhouette in supreme silver & cream panels. Grade-A quality checklist, zero outsole scuffs, feels and fits identical to deadstock.',
    stock: 2,
    createdAt: 1718914000000
  },
  {
    id: 'sb_006',
    name: 'Converse Chuck 70 High Vintage "Parchment"',
    brand: 'Converse',
    size: 8,
    condition: 'Excellent',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80'
    ],
    description: 'Heavyweight organic canvas high-tops featuring vintage black details and classic gloss rubber sidewalls. Extremely durable, sanitized inside and out.',
    stock: 3,
    createdAt: 1718915000000
  },
  {
    id: 'sb_007',
    name: 'sacai x Nike VaporWaffle "Sesame"',
    brand: 'Nike',
    size: 10.5,
    condition: 'Excellent',
    price: 410000,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    description: 'Highly sought double-upped collaboration. Features layered premium suede, waffle print waffle soles, and dual tongue structure. Laces fully intact.',
    stock: 1,
    createdAt: 1718916000000
  },
  {
    id: 'sb_008',
    name: 'Adidas Samba OG "Core Cloud White"',
    brand: 'Adidas',
    size: 9,
    condition: 'Like New',
    price: 135000,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
    description: 'Classically understated low-top terrace classic. Suede T-toe, retro gold lettering, clean gum sole with original grip profile. Steam-restored leather.',
    stock: 4,
    createdAt: 1718917000000
  }
];
