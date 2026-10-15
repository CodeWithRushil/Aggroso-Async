import { PolicySection } from '../types/index.js';

export const MARKETPLACE_POLICIES: PolicySection[] = [
  {
    id: 'MP-1.1',
    doc: 'Marketplace Policy',
    section: 'Section 1.1: Prohibited Goods & Regulated Substances',
    title: 'Prohibited Goods, Weapons, and Unapproved Pharmaceuticals',
    summary: 'The sale of illegal goods, firearms, prescription medicines, controlled substances, and hazardous materials is strictly forbidden.',
    full_text: 'Sellers are strictly prohibited from listing firearms, ammunition, controlled narcotics, unapproved prescription pharmaceuticals, explosive materials, hazardous chemicals, or paraphernalia. Any listing referencing illicit goods or prescription-only compounds will be immediately rejected.',
    keywords: ['gun', 'weapon', 'ammo', 'firearm', 'prescription', 'narcotic', 'pharmaceutical', 'steroids', 'explosive', 'chemical', 'toxic', 'cbd oil unapproved', 'viagra', 'adderall'],
    examples_bad: [
      'Prescription-grade sleep aids without doctor consult',
      'Tactical military rifle attachments and live ammo',
      'High grade industrial solvent and acid concentrate'
    ],
    examples_good: [
      'Over-the-counter herbal chamomile tea',
      'Camping tent and outdoor hiking poles',
      'Eco-friendly multi-surface household cleaner'
    ],
    default_severity: 'CRITICAL'
  },
  {
    id: 'MP-1.2',
    doc: 'Marketplace Policy',
    section: 'Section 1.2: Counterfeit, Replica, and Trademark Infringement',
    title: 'Counterfeits, Replicas, and Unauthorized Brand Usage',
    summary: 'Items claiming to be authentic must be genuine. Replicas, knockoffs, and unauthorized trademark usage are strictly banned.',
    full_text: 'Listings must not use brand names, logos, or trademarks unless the item is genuine and authorized. Terms like "replica", "clone", "1:1 copy", "dupe", "inspired by", or "fake" paired with trademarked brands are strictly prohibited.',
    keywords: ['replica', 'clone', '1:1', 'rep', 'dupe', 'fake', 'knockoff', 'counterfeit', 'unauthorized copy', 'mirror copy'],
    examples_bad: [
      'Rolex Submariner 1:1 AAA Mirror Clone Watch',
      'Air Jordan 4 Replica High Quality Dupe',
      'Gucci Belt Fake AAA+'
    ],
    examples_good: [
      'Genuine Vintage Leather Chronograph Watch',
      'Streetwear High-Top Canvas Sneakers',
      'Handcrafted Italian Leather Waist Belt'
    ],
    default_severity: 'CRITICAL'
  },
  {
    id: 'MP-2.1',
    doc: 'Marketplace Policy',
    section: 'Section 2.1: Safety Certifications & Recalled Products',
    title: 'Consumer Safety Standards and Product Recalls',
    summary: 'Electrical appliances, child toys, and safety gear must meet regulatory certifications and cannot be under active recall.',
    full_text: 'All electronic devices must state relevant safety certifications (e.g. UL, CE, FCC, RoHS). Items subject to national or international consumer product safety recalls are prohibited from being listed under any condition.',
    keywords: ['recalled', 'untested battery', 'overheating danger', 'choking hazard', 'no certification', 'bypass safety'],
    examples_bad: [
      'Hoverboard self-balancing scooter without safety battery certification',
      'Infant sleeper pad recalled by Consumer Safety Commission'
    ],
    examples_good: [
      'UL-certified dual-port USB-C fast charger with surge protection',
      'BPA-free silicone teething toy meeting ASTM safety standards'
    ],
    default_severity: 'HIGH'
  },
  {
    id: 'MP-3.1',
    doc: 'Marketplace Policy',
    section: 'Section 3.1: Price Deception & Misleading MSRP Discounts',
    title: 'Price Transparency and Artificial Discount Claims',
    summary: 'Prices must be accurate, transparent, and not employ inflated reference prices or fake discounts.',
    full_text: 'Listings must not state inflated comparative reference prices (e.g., "Regularly $5,000, now only $19.99") without verifiable commercial history. Unrealistic placeholder prices (e.g. $0.01) accompanied by excessive shipping fees are prohibited.',
    keywords: ['was $5000 now $10', 'retail $9999', 'fake discount', '99% off retail', 'free just pay shipping', 'ridiculous msrp'],
    examples_bad: [
      'Luxury Diamond Ring - Was $12,000, Today Only $29!',
      'Smart TV for $0.01 + $450 handling charge'
    ],
    examples_good: [
      'Sterling Silver Moissanite Ring - Competitive direct-to-consumer pricing at $89.00',
      '43-inch 4K UHD LED Smart TV - $249.99 with free standard shipping'
    ],
    default_severity: 'HIGH'
  },
  {
    id: 'MP-4.1',
    doc: 'Marketplace Policy',
    section: 'Section 4.1: Unverifiable, Superlative, and Medical Claims',
    title: 'Unverifiable Efficacy Claims, Absolutist Guarantees, and Medical Miracles',
    summary: 'Listings must not make unsubstantiated health, medical, financial, or absolute superlative claims.',
    full_text: 'Sellers must not claim a product can cure, treat, or prevent any medical condition, disease, or illness unless clinically proven and FDA-approved. Absolute unverifiable claims such as "100% cure rate", "best in the world", "infinite battery life", "guaranteed millionaire status", or "risk-free 1000% returns" are prohibited.',
    keywords: ['cure', '100% cure', 'miracle', 'cancer cure', 'best in the world', 'infinite battery', 'guaranteed profit', 'zero risk', 'undisputed #1', 'lose 30lbs in 3 days', 'magic remedy'],
    examples_bad: [
      'Miracle Herbal Tincture - 100% cures arthritis and eliminates pain forever',
      'Crypto Trading Bot - Guaranteed 500% profit with zero risk',
      'World’s #1 Undisputed Best Headphones Ever Invented'
    ],
    examples_good: [
      'Herbal Joint Comfort Tea with Organic Turmeric and Ginger',
      'Algorithmic Market Data Visualizer for Technical Traders',
      'High-Fidelity Over-Ear Studio Headphones with 40mm Drivers'
    ],
    default_severity: 'HIGH'
  },
  {
    id: 'MP-5.1',
    doc: 'Marketplace Policy',
    section: 'Section 5.1: Off-Platform Diversion and Direct Contact Solicitations',
    title: 'Prohibition of Off-Platform Transactions and Direct Seller Contact',
    summary: 'Listings must not divert buyers off-platform or request payment via external channels.',
    full_text: 'Sellers must not include direct phone numbers, email addresses, WhatsApp numbers, Telegram handles, cryptocurrency wallet addresses, or requests to pay via CashApp, Venmo, or wire transfer to circumvent marketplace buyer protection.',
    keywords: ['whatsapp', 'telegram', 'wire transfer', 'cashapp', 'venmo', 'pay outside', 'call me at', 'email me directly', 'contact off-platform', 'zelle me'],
    examples_bad: [
      'Do not buy here! Message me on WhatsApp +1-555-0199 for 20% discount via Zelle',
      'Contact sales@externalsite.com or DM telegram @seller123 to complete purchase'
    ],
    examples_good: [
      'Orders are securely processed through Marketplace Checkout with Buyer Protection Guarantee.'
    ],
    default_severity: 'CRITICAL'
  },
  {
    id: 'MP-6.1',
    doc: 'Marketplace Policy',
    section: 'Section 6.1: Category Taxonomy & Classification Compliance',
    title: 'Accurate Category Assignment and Supported Taxonomy',
    summary: 'Listings must be placed in appropriate recognized taxonomy categories.',
    full_text: 'Every listing must be assigned to an authorized marketplace category. Misclassifying an item to circumvent fees, avoid category restrictions, or manipulate search visibility is prohibited.',
    keywords: ['misclassified', 'wrong category', 'unsupported category', 'taxonomy evasion'],
    examples_bad: [
      'Selling gaming laptop listed under "Books & Media" to pay lower category fees'
    ],
    examples_good: [
      'Selling gaming laptop listed under "Electronics"'
    ],
    default_severity: 'MEDIUM'
  }
];
