import express from 'express';
import cors from 'cors';
import concursoRoutes from './routes/concursoRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', concursoRoutes);
app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.send('Backend do Concurseiros Conecta rodando!');
});

app.listen(PORT, () => {
  console.log(`O servidor está rodando na porta ${PORT}`);
});