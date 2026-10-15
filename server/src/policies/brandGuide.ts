import { PolicySection } from '../types/index.js';

export const BRAND_CONTENT_GUIDES: PolicySection[] = [
  {
    id: 'BRAND-1.1',
    doc: 'Brand-Content Guide',
    section: 'Guide 1.1: Professional, Objective Tone of Voice',
    title: 'Tone of Voice: Professional, Informative, and Dignified',
    summary: 'Content must communicate value objectively, avoiding hype, sensationalism, and desperate sales tactics.',
    full_text: 'Our marketplace values customer trust. Descriptions should be clear, concise, and informative rather than sensational. Avoid emotional manipulation, panic triggers (e.g. "BUY NOW BEFORE GONE FOREVER!!"), spammy jargon, or aggressive sales rhetoric.',
    keywords: ['buy now or regret', 'hurry up', 'act fast', 'unreal bargain', 'crazy deal', 'insane discount', 'mind blowing', 'jaw dropping'],
    examples_bad: [
      'DON\'T MISS THIS CRAZY INSANE ONCE IN A LIFETIME DEAL BUY RIGHT NOW OR YOU WILL CRY!!!',
      'The most sick and mind-blowing gadget you have ever seen in your life bro'
    ],
    examples_good: [
      'Ergonomically designed mechanical keyboard featuring tactile brown switches and RGB backlighting.',
      'Limited production run crafted from aerospace-grade aluminum alloy.'
    ],
    default_severity: 'MEDIUM'
  },
  {
    id: 'BRAND-1.2',
    doc: 'Brand-Content Guide',
    section: 'Guide 1.2: Typography, Casing, and Emoji Formatting',
    title: 'Typography & Formatting: Clean Casing and Restrained Emoji Use',
    summary: 'Titles and descriptions must follow standard title/sentence capitalization and avoid emoji spam or excessive punctuation.',
    full_text: 'Titles must use proper Title Case or Sentence case. DO NOT use all-caps for whole words or phrases (e.g. "SUPER HOT DEAL"). Limit emoji usage to a maximum of one relevant emoji or none; emoji clusters (e.g. "🔥🔥🔥🚀🚀") look unprofessional and dilute brand trust.',
    keywords: ['ALL CAPS', 'emoji stuffing', 'multiple exclamation marks', '???', '!!!', 'excessive punctuation'],
    examples_bad: [
      '🔥🔥🔥 SUPER FAST CHARGER USB C 100W MEGA POWER 🚀🚀🚀 LOOK HERE NOW!!!!',
      'BEST SOUND EVER CREATED!!!!!! MUST BUY TODAY'
    ],
    examples_good: [
      'Anker 100W USB-C GaN Fast Charger with Foldable Prongs (Dual Port)',
      'Audeze LCD-X Open-Back Over-Ear Planar Magnetic Headphones'
    ],
    default_severity: 'MEDIUM'
  },
  {
    id: 'BRAND-2.1',
    doc: 'Brand-Content Guide',
    section: 'Guide 2.1: Complete & Structured Attribute Specifications',
    title: 'Product Specifications and Standardized Metric/Imperial Units',
    summary: 'Listings must include specific technical attributes with standard units of measurement.',
    full_text: 'Technical and physical properties should be specified using standardized units (e.g., mm, cm, kg, lbs, mAh, Watts, Hz, GB). Avoid vague descriptions like "huge storage" or "super light" without concrete numbers in attributes.',
    keywords: ['vague specs', 'huge', 'tiny', 'very fast', 'heavy duty', 'massive battery', 'missing attributes', 'unspecified dimensions'],
    examples_bad: [
      'Huge battery that lasts super long and very fast processor with tons of RAM',
      'Heavy duty metal construction that feels solid'
    ],
    examples_good: [
      'Battery Capacity: 5,000 mAh (up to 18 hours video playback); Weight: 185g; Dimensions: 146.7 x 71.5 x 7.8 mm',
      'Constructed from 6061-T6 anodized aluminum with 2.5mm wall thickness'
    ],
    default_severity: 'LOW'
  },
  {
    id: 'BRAND-2.2',
    doc: 'Brand-Content Guide',
    section: 'Guide 2.2: Condition Transparency and Warranty Terms',
    title: 'Accurate Condition Grading and Return/Warranty Terms',
    summary: 'Condition must be transparently designated and warranty or return periods clearly stated.',
    full_text: 'Listings must specify item condition (New, Open Box, Certified Refurbished, or Pre-Owned/Used). For refurbished or used items, any cosmetic blemishes or functional notes must be listed upfront along with warranty duration.',
    keywords: ['condition unclear', 'as-is no returns', 'maybe works', 'mystery condition', 'unknown warranty'],
    examples_bad: [
      'Sold as-is, don\'t ask questions, might have scratches or might not work',
      'Used phone, seems fine'
    ],
    examples_good: [
      'Condition: Certified Refurbished Grade A (Minor micro-scratches on rear casing, 100% battery health). Includes 90-day marketplace warranty.',
      'Condition: Brand New in Factory Sealed Retail Box with 1-Year Manufacturer Warranty.'
    ],
    default_severity: 'HIGH'
  },
  {
    id: 'BRAND-3.1',
    doc: 'Brand-Content Guide',
    section: 'Guide 3.1: Search Hygiene and Keyword Spamming Prohibition',
    title: 'Keyword Integrity and Anti-Spam Standards',
    summary: 'Do not stuff unrelated brand names, repetitive synonyms, or misleading search keywords.',
    full_text: 'Title and description must relate strictly to the product being offered. Do not append unrelated brand names (e.g., "Generic Earbuds like Apple AirPods Pro Bose Sony Beats") to hijack search traffic.',
    keywords: ['keyword stuffing', 'like apple', 'similar to rolex', 'not nike', 'fake tags', 'tag spam'],
    examples_bad: [
      'Wireless Earphones bluetooth like airpods pro sony bose sennheiser skullcandy jbl headphones',
      'Casual hoodie supreme bape off-white style travis scott streetwear'
    ],
    examples_good: [
      'Soundcore Life Q30 Wireless Active Noise Cancelling Headphones',
      'Champion Reverse Weave Heavyweight Fleece Hoodie'
    ],
    default_severity: 'MEDIUM'
  },
  {
    id: 'BRAND-3.2',
    doc: 'Brand-Content Guide',
    section: 'Guide 3.2: Formatting Structure and Readability',
    title: 'Content Structure, Paragraph Length, and Scannability',
    summary: 'Descriptions should utilize paragraphs and bullet points for effortless scannability.',
    full_text: 'Customers skim listings on mobile and desktop devices. Large walls of unbroken text are discouraged. Structure descriptions with a 2-3 sentence overview followed by bulleted key features and package contents.',
    keywords: ['wall of text', 'unreadable', 'no line breaks', 'unformatted'],
    examples_bad: [
      'This product is made from good stuff and here is a giant 800 word paragraph with no punctuation or spacing describing everything in one continuous block of text that hurts customer eyes...',
    ],
    examples_good: [
      'The ProTech Studio Monitor provides reference-grade audio fidelity for producers and podcasters.\n\nKey Features:\n• 8-inch Kevlar woven woofer\n• 1-inch silk dome tweeter\n• XLR and TRS balanced inputs\n\nPackage Includes:\n• 2x Studio Monitors\n• 2x Isolation Pads\n• 2x AC Power Cables'
    ],
    default_severity: 'LOW'
  }
];
