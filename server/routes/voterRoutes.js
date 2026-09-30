import express from 'express';
import { requireAuth, requireVoter } from '../middleware/auth.js';
import { getRegionalElections, castVote } from '../controllers/voterController.js';

const router = express.Router();

router.use(requireAuth, requireVoter);
router.get('/elections', getRegionalElections);
router.post('/vote', castVote);

export default router;