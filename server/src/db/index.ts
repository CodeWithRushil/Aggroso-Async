import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_LISTINGS } from './seedData.js';
import { reviewerAgent } from '../ai/reviewerAgent.js';
import { Listing, ReviewReport, AuditLogEntry } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'marketplace_reviewer.sqlite');

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let db: Database;
  let isFresh = false;

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('Failed reading existing SQLite DB file, creating fresh database...', err);
      db = new SQL.Database();
      isFresh = true;
    }
  } else {
    db = new SQL.Database();
    isFresh = true;
  }

  // Initialize Tables
  db.run(`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      attributes TEXT NOT NULL DEFAULT '{}',
      seller TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      overall_score INTEGER NOT NULL,
      review_status TEXT NOT NULL,
      deterministic_issues TEXT NOT NULL,
      findings TEXT NOT NULL,
      unverifiable_claims TEXT NOT NULL,
      suggestions TEXT NOT NULL,
      retrieved_policy_sections TEXT NOT NULL,
      ai_model_used TEXT NOT NULL,
      execution_duration_ms INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      review_id TEXT,
      action TEXT NOT NULL,
      field_name TEXT,
      reviewer TEXT NOT NULL,
      previous_value TEXT,
      new_value TEXT,
      notes TEXT,
      timestamp TEXT NOT NULL
    );
  `);

  dbInstance = db;

  if (isFresh) {
    await seedDatabase(db);
  }

  return db;
}

export function saveDbToDisk(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

async function seedDatabase(db: Database): Promise<void> {
  console.log('🌱 Seeding initial marketplace listings and generating AI reviews...');

  for (const listing of SEED_LISTINGS) {
    db.run(
      `INSERT INTO listings (id, title, description, category, price, currency, attributes, seller, tags, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listing.id,
        listing.title,
        listing.description,
        listing.category,
        listing.price,
        listing.currency,
        JSON.stringify(listing.attributes),
        listing.seller,
        JSON.stringify(listing.tags),
        listing.status,
        listing.created_at,
        listing.updated_at
      ]
    );

    // Generate initial review report for the seed listing
    const review = await reviewerAgent.reviewListing(listing, SEED_LISTINGS);
    
    db.run(
      `INSERT INTO reviews (id, listing_id, overall_score, review_status, deterministic_issues, findings, unverifiable_claims, suggestions, retrieved_policy_sections, ai_model_used, execution_duration_ms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        review.id,
        review.listing_id,
        review.overall_score,
        review.review_status,
        JSON.stringify(review.deterministic_issues),
        JSON.stringify(review.findings),
        JSON.stringify(review.unverifiable_claims),
        JSON.stringify(review.suggestions),
        JSON.stringify(review.retrieved_policy_sections),
        review.ai_model_used,
        review.execution_duration_ms,
        review.created_at
      ]
    );

    // Initial audit log
    db.run(
      `INSERT INTO audit_logs (id, listing_id, review_id, action, reviewer, notes, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `audit-${listing.id}-init`,
        listing.id,
        review.id,
        'REVIEW_GENERATED',
        'AI Quality Agent',
        `Automated quality assessment completed. Score: ${review.overall_score}/100. Status: ${review.review_status}`,
        new Date().toISOString()
      ]
    );
  }

  saveDbToDisk();
  console.log('✅ Seeding complete.');
}

// Helper query wrappers
export async function getAllListings(): Promise<Listing[]> {
  const db = await getDb();
  const res = db.exec('SELECT * FROM listings ORDER BY created_at DESC');
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const item: any = {};
    columns.forEach((col, idx) => {
      item[col] = row[idx];
    });
    item.attributes = JSON.parse(item.attributes || '{}');
    item.tags = JSON.parse(item.tags || '[]');
    return item as Listing;
  });
}

export async function getListingById(id: string): Promise<Listing | null> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM listings WHERE id = :id');
  stmt.bind({ ':id': id });
  if (stmt.step()) {
    const row = stmt.getAsObject() as any;
    stmt.free();
    row.attributes = JSON.parse(row.attributes || '{}');
    row.tags = JSON.parse(row.tags || '[]');
    return row as Listing;
  }
  stmt.free();
  return null;
}

export async function saveListing(listing: Listing): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT OR REPLACE INTO listings (id, title, description, category, price, currency, attributes, seller, tags, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      listing.id,
      listing.title,
      listing.description,
      listing.category,
      listing.price,
      listing.currency,
      JSON.stringify(listing.attributes || {}),
      listing.seller,
      JSON.stringify(listing.tags || []),
      listing.status,
      listing.created_at,
      listing.updated_at
    ]
  );
  saveDbToDisk();
}

export async function getLatestReviewForListing(listingId: string): Promise<ReviewReport | null> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM reviews WHERE listing_id = :id ORDER BY created_at DESC LIMIT 1');
  stmt.bind({ ':id': listingId });
  if (stmt.step()) {
    const row = stmt.getAsObject() as any;
    stmt.free();
    return {
      id: row.id,
      listing_id: row.listing_id,
      overall_score: row.overall_score,
      review_status: row.review_status,
      deterministic_issues: JSON.parse(row.deterministic_issues || '[]'),
      findings: JSON.parse(row.findings || '[]'),
      unverifiable_claims: JSON.parse(row.unverifiable_claims || '[]'),
      suggestions: JSON.parse(row.suggestions || '{}'),
      retrieved_policy_sections: JSON.parse(row.retrieved_policy_sections || '[]'),
      ai_model_used: row.ai_model_used,
      execution_duration_ms: row.execution_duration_ms,
      created_at: row.created_at
    };
  }
  stmt.free();
  return null;
}

export async function saveReview(review: ReviewReport): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT OR REPLACE INTO reviews (id, listing_id, overall_score, review_status, deterministic_issues, findings, unverifiable_claims, suggestions, retrieved_policy_sections, ai_model_used, execution_duration_ms, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      review.id,
      review.listing_id,
      review.overall_score,
      review.review_status,
      JSON.stringify(review.deterministic_issues),
      JSON.stringify(review.findings),
      JSON.stringify(review.unverifiable_claims),
      JSON.stringify(review.suggestions),
      JSON.stringify(review.retrieved_policy_sections),
      review.ai_model_used,
      review.execution_duration_ms,
      review.created_at
    ]
  );
  saveDbToDisk();
}

export async function addAuditLog(entry: AuditLogEntry): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT INTO audit_logs (id, listing_id, review_id, action, field_name, reviewer, previous_value, new_value, notes, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.listing_id,
      entry.review_id || null,
      entry.action,
      entry.field_name || null,
      entry.reviewer,
      entry.previous_value !== undefined ? JSON.stringify(entry.previous_value) : null,
      entry.new_value !== undefined ? JSON.stringify(entry.new_value) : null,
      entry.notes || null,
      entry.timestamp
    ]
  );
  saveDbToDisk();
}

export async function getAuditLogsForListing(listingId: string): Promise<AuditLogEntry[]> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM audit_logs WHERE listing_id = :id ORDER BY timestamp DESC');
  stmt.bind({ ':id': listingId });
  const entries: AuditLogEntry[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    entries.push({
      id: row.id,
      listing_id: row.listing_id,
      review_id: row.review_id,
      action: row.action,
      field_name: row.field_name,
      reviewer: row.reviewer,
      previous_value: row.previous_value ? JSON.parse(row.previous_value) : undefined,
      new_value: row.new_value ? JSON.parse(row.new_value) : undefined,
      notes: row.notes,
      timestamp: row.timestamp
    });
  }
  stmt.free();
  return entries;
}
