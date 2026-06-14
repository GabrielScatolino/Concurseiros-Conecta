import { Router } from 'express';
import {
  createConcurso,
  getAllConcursos,
  getConcursoById,
  updateConcurso,
  deleteConcurso
} from '../controllers/concursoController.js';

const router = Router();

router.post('/concursos', createConcurso);
router.get('/concursos', getAllConcursos);
router.get('/concursos/:id', getConcursoById);
router.put('/concursos/:id', updateConcurso);
router.delete('/concursos/:id', deleteConcurso);

export default router;