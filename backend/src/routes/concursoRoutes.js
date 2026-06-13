import { Router } from 'express';
import {
  createEdital,
  getAllEditais,
  getEditalById,
  updateEdital,
  deleteEdital
} from '../controllers/concursoController.js';

const router = Router();

router.post('/editais', createEdital);
router.get('/editais', getAllEditais);
router.get('/editais/:id', getEditalById);
router.put('/editais/:id', updateEdital);
router.delete('/editais/:id', deleteEdital);

export default router;