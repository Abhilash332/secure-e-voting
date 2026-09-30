import express from 'express';
import { requireAuth, requireCommission } from '../middleware/auth.js';
import { createElection, getElectionResults } from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAuth, requireCommission);
router.post('/election', createElection);
router.get('/results', getElectionResults);

export default router;