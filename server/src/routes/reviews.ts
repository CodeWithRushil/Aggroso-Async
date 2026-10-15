import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  getListingById, 
  saveListing, 
  getLatestReviewForListing, 
  saveReview, 
  addAuditLog, 
  getAuditLogsForListing 
} from '../db/index.js';
import { logger } from '../logger/index.js';

const router = Router();

// POST /api/reviews/:id/decision - human review action for a specific field suggestion
router.post('/:id/decision', async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    const { 
      listingId, 
      field, 
      decision, // 'accepted' | 'edited' | 'rejected'
      editedValue, 
      reviewer = 'Reviewer',
      notes 
    } = req.body;

    if (!listingId || !field || !decision) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: listingId, field, decision' 
      });
    }

    const review = await getLatestReviewForListing(listingId);
    const listing = await getListingById(listingId);

    if (!review || !listing) {
      return res.status(404).json({ success: false, error: 'Review or listing not found' });
    }

    const suggestion = (review.suggestions as any)[field];
    if (!suggestion) {
      return res.status(400).json({ success: false, error: `No suggestion exists for field "${field}"` });
    }

    const prevValue = (listing as any)[field];
    let appliedValue = prevValue;

    // Update suggestion state
    suggestion.status = decision;
    if (decision === 'edited' && editedValue !== undefined) {
      suggestion.user_edited_value = editedValue;
      appliedValue = editedValue;
      (listing as any)[field] = editedValue;
    } else if (decision === 'accepted') {
      appliedValue = suggestion.suggested;
      (listing as any)[field] = suggestion.suggested;
    }

    listing.updated_at = new Date().toISOString();
    await saveListing(listing);
    await saveReview(review);

    // Record in audit log
    const auditAction = decision === 'accepted' ? 'FIELD_ACCEPTED' : decision === 'edited' ? 'FIELD_EDITED' : 'FIELD_REJECTED';
    await addAuditLog({
      id: uuidv4(),
      listing_id: listing.id,
      review_id: review.id,
      action: auditAction,
      field_name: field,
      reviewer,
      previous_value: prevValue,
      new_value: appliedValue,
      notes: notes || `Field "${field}" marked as ${decision.toUpperCase()} by ${reviewer}`,
      timestamp: new Date().toISOString()
    });

    logger.info('REVIEW_DECISION', `Field "${field}" updated with decision "${decision}"`, {
      listingId: listing.id,
      reviewer
    });

    const updatedAuditLogs = await getAuditLogsForListing(listing.id);

    res.json({
      success: true,
      data: {
        listing,
        review,
        auditLogs: updatedAuditLogs
      }
    });
  } catch (err: any) {
    logger.error('REVIEWS_ROUTE', 'Failed applying suggestion decision', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews/:id/finalize - overall approve or reject listing
router.post('/:id/finalize', async (req: Request, res: Response) => {
  try {
    const { listingId, decision, reviewer = 'Quality Lead', notes } = req.body;

    if (!listingId || !decision) {
      return res.status(400).json({ success: false, error: 'Missing listingId or decision (APPROVED | REJECTED)' });
    }

    const listing = await getListingById(listingId);
    const review = await getLatestReviewForListing(listingId);

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    listing.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    listing.updated_at = new Date().toISOString();
    await saveListing(listing);

    await addAuditLog({
      id: uuidv4(),
      listing_id: listing.id,
      review_id: review?.id,
      action: decision === 'APPROVED' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      reviewer,
      previous_value: listing.status,
      new_value: decision,
      notes: notes || `Listing explicitly marked as ${decision} by ${reviewer}`,
      timestamp: new Date().toISOString()
    });

    logger.info('REVIEW_FINALIZE', `Listing ${listing.id} finalized as ${decision} by ${reviewer}`);

    const updatedAuditLogs = await getAuditLogsForListing(listing.id);

    res.json({
      success: true,
      data: {
        listing,
        review,
        auditLogs: updatedAuditLogs
      }
    });
  } catch (err: any) {
    logger.error('REVIEWS_ROUTE', 'Failed finalizing listing review', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
