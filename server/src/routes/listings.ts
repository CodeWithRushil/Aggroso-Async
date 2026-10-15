import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  getAllListings, 
  getListingById, 
  saveListing, 
  getLatestReviewForListing, 
  saveReview, 
  addAuditLog, 
  getAuditLogsForListing 
} from '../db/index.js';
import { reviewerAgent } from '../ai/reviewerAgent.js';
import { logger } from '../logger/index.js';
import { Listing } from '../types/index.js';

const router = Router();

// GET /api/listings - list all listings with latest review summary
router.get('/', async (_req: Request, res: Response) => {
  try {
    const listings = await getAllListings();
    const enriched = await Promise.all(
      listings.map(async (item) => {
        const review = await getLatestReviewForListing(item.id);
        return {
          ...item,
          latest_review: review ? {
            id: review.id,
            overall_score: review.overall_score,
            review_status: review.review_status,
            findings_count: review.findings.length,
            critical_count: review.findings.filter(f => f.severity === 'CRITICAL').length,
            high_count: review.findings.filter(f => f.severity === 'HIGH').length,
            claims_count: review.unverifiable_claims.length,
            created_at: review.created_at
          } : null
        };
      })
    );
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err: any) {
    logger.error('LISTINGS_ROUTE', 'Failed retrieving listings', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/listings/:id - get single listing with review and audit history
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const listingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const listing = await getListingById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const review = await getLatestReviewForListing(listing.id);
    const auditLogs = await getAuditLogsForListing(listing.id);

    res.json({
      success: true,
      data: {
        listing,
        review,
        auditLogs
      }
    });
  } catch (err: any) {
    logger.error('LISTINGS_ROUTE', `Failed retrieving listing ${req.params.id}`, { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/listings - create listing and auto-trigger AI quality review
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, category, price, attributes, seller, tags } = req.body;

    const newListing: Listing = {
      id: uuidv4(),
      title: (title || '').trim(),
      description: (description || '').trim(),
      category: (category || '').trim(),
      price: Number(price) || 0,
      currency: 'USD',
      attributes: attributes || {},
      seller: (seller || 'Quality Team Seller').trim(),
      tags: Array.isArray(tags) ? tags : [],
      status: 'PENDING_REVIEW',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    logger.info('LISTING_CREATE', `Creating new listing: "${newListing.title}"`, { seller: newListing.seller });
    await saveListing(newListing);

    // Run AI quality review
    const allExisting = await getAllListings();
    logger.info('AI_AGENT', `Triggering AI quality review for listing ${newListing.id}`);
    const review = await reviewerAgent.reviewListing(newListing, allExisting);
    await saveReview(review);

    // Update listing status based on review
    newListing.status = review.review_status;
    newListing.updated_at = new Date().toISOString();
    await saveListing(newListing);

    // Audit log
    await addAuditLog({
      id: uuidv4(),
      listing_id: newListing.id,
      review_id: review.id,
      action: 'LISTING_CREATED',
      reviewer: 'System / User',
      notes: `Listing created and reviewed. Score: ${review.overall_score}/100. Status: ${review.review_status}`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      data: {
        listing: newListing,
        review
      }
    });
  } catch (err: any) {
    logger.error('LISTINGS_ROUTE', 'Failed creating listing', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/listings/:id/review - re-run review on demand
router.post('/:id/review', async (req: Request, res: Response) => {
  try {
    const listingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const listing = await getListingById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const allExisting = await getAllListings();
    logger.info('AI_AGENT', `Manual re-review requested for ${listing.id}`);
    const review = await reviewerAgent.reviewListing(listing, allExisting);
    await saveReview(review);

    listing.status = review.review_status;
    listing.updated_at = new Date().toISOString();
    await saveListing(listing);

    await addAuditLog({
      id: uuidv4(),
      listing_id: listing.id,
      review_id: review.id,
      action: 'REVIEW_GENERATED',
      reviewer: req.body.reviewer || 'Reviewer Analyst',
      notes: `Manual review rerun completed. Quality Score: ${review.overall_score}/100. Status: ${review.review_status}`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        listing,
        review
      }
    });
  } catch (err: any) {
    logger.error('LISTINGS_ROUTE', `Failed re-reviewing ${req.params.id}`, { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
