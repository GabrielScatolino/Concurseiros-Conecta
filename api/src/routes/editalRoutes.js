import { Router } from 'express';
import {
  createEdital,
  getAllEditais,
  getEditalById,
  updateEdital,
  deleteEdital
} from '../controllers/editalController.js';

const router = Router();

router.post('/editais', createEdital);
router.get('/editais', getAllEditais);
router.get('/editais/:id', getEditalById);
router.put('/editais/:id', updateEdital);
router.delete('/editais/:id', deleteEdital);

export default router;