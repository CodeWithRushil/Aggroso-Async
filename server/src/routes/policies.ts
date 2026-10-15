import { Router, Request, Response } from 'express';
import { defaultPolicyEngine } from '../policies/policyEngine.js';

const router = Router();

// GET /api/policies - retrieve all policy and brand guide sections
router.get('/', (_req: Request, res: Response) => {
  const policies = defaultPolicyEngine.getAllPolicies();
  res.json({
    success: true,
    count: policies.length,
    data: policies
  });
});

// GET /api/policies/search - search policies by keyword or section
router.get('/search', (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  const all = defaultPolicyEngine.getAllPolicies();

  if (!q) {
    return res.json({ success: true, count: all.length, data: all });
  }

  const filtered = all.filter(p => 
    p.title.toLowerCase().includes(q) ||
    p.section.toLowerCase().includes(q) ||
    p.summary.toLowerCase().includes(q) ||
    p.full_text.toLowerCase().includes(q) ||
    p.keywords.some(k => k.toLowerCase().includes(q))
  );

  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

export default router;
