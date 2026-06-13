import express from 'express';
import cors from 'cors';
import editalRoutes from './routes/concursoRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', editalRoutes);
app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Backend do Concurseiro Conecta rodando!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});