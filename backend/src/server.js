import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import editalRoutes from './routes/editalRoutes.js';
import userRoutes from './routes/userRoutes.js'; // IMPORTADO AQUI

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Registrando os dois endpoints da nossa API
app.use('/api', editalRoutes);
app.use('/api', userRoutes); // ADICIONADO AQUI

// Rota base de teste
app.get('/', (req, res) => {
  res.send('🚀 Backend do Concurseiro Conecta rodando!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});