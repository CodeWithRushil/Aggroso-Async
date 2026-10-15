import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  getAllListings, 
  getListingById, 
  saveListing, 
  saveReview, 
  addAuditLog 
} from '../db/index.js';
import { reviewerAgent } from '../ai/reviewerAgent.js';
import { logger } from '../logger/index.js';
import { Listing, BatchProcessingItem } from '../types/index.js';

const router = Router();

// POST /api/batch/review - process a batch of listings
router.post('/review', async (req: Request, res: Response) => {
  try {
    const { listingIds, newListings } = req.body;
    const itemsToProcess: Listing[] = [];

    // Case 1: Batch of existing IDs
    if (Array.isArray(listingIds) && listingIds.length > 0) {
      for (const id of listingIds) {
        const item = await getListingById(id);
        if (item) itemsToProcess.push(item);
      }
    } 
    // Case 2: Batch of new listings (e.g. uploaded via JSON / CSV)
    else if (Array.isArray(newListings) && newListings.length > 0) {
      for (const raw of newListings) {
        const created: Listing = {
          id: raw.id || uuidv4(),
          title: (raw.title || '').trim(),
          description: (raw.description || '').trim(),
          category: (raw.category || 'Electronics').trim(),
          price: Number(raw.price) || 0,
          currency: raw.currency || 'USD',
          attributes: raw.attributes || {},
          seller: (raw.seller || 'Batch Uploader').trim(),
          tags: Array.isArray(raw.tags) ? raw.tags : [],
          status: 'PENDING_REVIEW',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await saveListing(created);
        itemsToProcess.push(created);
      }
    } else {
      // Default: process all current listings
      const all = await getAllListings();
      itemsToProcess.push(...all);
    }

    logger.info('BATCH_PROCESSOR', `Starting batch review of ${itemsToProcess.length} listings...`);
    const allExisting = await getAllListings();

    const results: BatchProcessingItem[] = [];
    let compliantCount = 0;
    let needsRevisionCount = 0;
    let flaggedCount = 0;
    let totalScore = 0;

    for (const listing of itemsToProcess) {
      try {
        const review = await reviewerAgent.reviewListing(listing, allExisting);
        await saveReview(review);

        listing.status = review.review_status;
        listing.updated_at = new Date().toISOString();
        await saveListing(listing);

        await addAuditLog({
          id: uuidv4(),
          listing_id: listing.id,
          review_id: review.id,
          action: 'BATCH_PROCESSED',
          reviewer: req.body.reviewer || 'Batch Quality Automation',
          notes: `Batch quality review evaluated. Score: ${review.overall_score}/100. Status: ${review.review_status}`,
          timestamp: new Date().toISOString()
        });

        if (review.review_status === 'COMPLIANT') compliantCount++;
        else if (review.review_status === 'NEEDS_REVISION') needsRevisionCount++;
        else if (review.review_status === 'FLAGGED') flaggedCount++;

        totalScore += review.overall_score;

        results.push({
          listing_id: listing.id,
          title: listing.title,
          status: 'completed',
          score: review.overall_score,
          review_status: review.review_status,
          critical_count: review.findings.filter(f => f.severity === 'CRITICAL').length
        });
      } catch (err: any) {
        logger.error('BATCH_PROCESSOR', `Failed processing item ${listing.id}`, { error: err.message });
        results.push({
          listing_id: listing.id,
          title: listing.title,
          status: 'failed',
          error: err.message
        });
      }
    }

    const avgScore = itemsToProcess.length > 0 ? Math.round(totalScore / itemsToProcess.length) : 0;

    logger.info('BATCH_PROCESSOR', `Completed batch review of ${itemsToProcess.length} listings. Compliant: ${compliantCount}, Needs Revision: ${needsRevisionCount}, Flagged: ${flaggedCount}`);

    res.json({
      success: true,
      summary: {
        total: itemsToProcess.length,
        compliant: compliantCount,
        needsRevision: needsRevisionCount,
        flagged: flaggedCount,
        averageScore: avgScore
      },
      items: results
    });
  } catch (err: any) {
    logger.error('BATCH_PROCESSOR', 'Batch processing failed', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
