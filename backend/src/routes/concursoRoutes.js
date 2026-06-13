import { Router } from 'express';
import {
  createConcurso,
  getAllConcursos,
  getConcursoById,
  updateConcurso,
  deleteConcurso
} from '../controllers/concursoController.js';

const router = Router();

router.post('/editais', createConcurso);
router.get('/editais', getAllConcursos);
router.get('/editais/:id', getConcursoById);
router.put('/editais/:id', updateConcurso);
router.delete('/editais/:id', deleteConcurso);

export default router;