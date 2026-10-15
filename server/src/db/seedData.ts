import { Listing } from '../types/index.js';

export const SEED_LISTINGS: Listing[] = [
  {
    id: 'list-seed-001',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation with two processors and 8 microphones. Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback). Lightweight design with soft fit leather.\n\nKey Specifications:\n• Driver Unit: 30mm\n• Weight: 250g\n• Connectivity: Bluetooth 5.2, 3.5mm Aux\n• Frequency Response: 4Hz - 40,000Hz\n\nCondition: Certified Refurbished Grade A (includes 90-day marketplace warranty).',
    category: 'Electronics',
    price: 279.99,
    currency: 'USD',
    attributes: {
      'Brand': 'Sony',
      'Model': 'WH-1000XM5',
      'Condition': 'Certified Refurbished',
      'Color': 'Black',
      'Warranty': '90-Day Warranty',
      'Battery Life': '30 Hours'
    },
    seller: 'AudioTech Direct',
    tags: ['sony', 'headphones', 'noise-cancelling', 'bluetooth'],
    status: 'COMPLIANT',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'list-seed-002',
    title: 'Rolex Submariner 1:1 AAA Mirror Clone Luxury Watch',
    description: 'Super high quality replica rolex submariner watch! Looks and feels 100% identical to the real original. Automatic sweeping movement with sapphire crystal glass. Do not buy on site directly, message me on WhatsApp +1-555-0199 or telegram @luxwatch for 20% discount via Zelle wire payment!',
    category: 'Apparel & Accessories',
    price: 349.00,
    currency: 'USD',
    attributes: {
      'Brand': 'Rolex',
      'Style': 'Submariner',
      'Type': '1:1 Replica Clone'
    },
    seller: 'FastLuxuryReplicas',
    tags: ['rolex', 'replica', 'clone', 'dupe', 'luxury-watch'],
    status: 'FLAGGED',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'list-seed-003',
    title: 'Miracle Arctic Herbal Elixir - 100% Cures Joint Pain Forever',
    description: 'Undisputed #1 best natural health remedy in the world! Our secret patented herbal formula 100% cures arthritis, chronic inflammation, and eliminates all joint pain in 48 hours guaranteed. Miracle healing power backed by ancient monks with zero side effects. Act fast, buy now or regret missing this!',
    category: 'Beauty & Health',
    price: 49.95,
    currency: 'USD',
    attributes: {
      'Volume': '100ml',
      'Ingredients': 'Herbal Extract Blend',
      'Efficacy': '100% Guaranteed Cure'
    },
    seller: 'BioWellness Labs',
    tags: ['miracle', 'joint-cure', 'arthritis-cure', 'herbal'],
    status: 'NEEDS_REVISION',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'list-seed-004',
    title: '🔥🔥🔥 SUPER FAST CHARGER USB C 100W POWER ADAPTER 🚀🚀 LOOK HERE NOW!!!!',
    description: 'DON\'T MISS THIS CRAZY INSANE DEAL BUY RIGHT NOW BEFORE STOCK RUNS OUT FOREVER!! Super fast charging power brick with huge power that charges everything in seconds like Apple macbook charger bose anker style. Massive power with unbreakable heavy duty cable!!',
    category: 'Electronics',
    price: 18.50,
    currency: 'USD',
    attributes: {
      'Power': 'Huge power',
      'Speed': 'Super fast'
    },
    seller: 'GadgetZone Global',
    tags: ['charger', 'fast-charging', 'usb-c', 'deal'],
    status: 'NEEDS_REVISION',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'list-seed-005',
    title: 'Professional Mechanical Ergonomic Gaming Keyboard',
    description: 'Minimalist 75% hot-swappable mechanical keyboard with lubricated linear switches, sound dampening foam, and PBT double-shot keycaps. Works wired via braided USB-C or 2.4Ghz wireless.',
    category: 'InvalidHardwareCategory',
    price: 0.10,
    currency: 'USD',
    attributes: {
      'Switches': 'Gateron Yellow Linear'
    },
    seller: 'DeskCraft Studios',
    tags: ['mechanical-keyboard', 'gaming'],
    status: 'NEEDS_REVISION',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];
