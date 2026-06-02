import prisma from '../config/prisma.js';

// 1. CRIAR um Edital (Create)
export const createEdital = async (req, res) => {
  try {
    const { title, banca, description, examDate } = req.body;
    
    const newEdital = await prisma.edital.create({
      data: {
        title,
        banca,
        description,
        // Converte a string de data que vem do front para o formato do banco
        examDate: examDate ? new Date(examDate) : null, 
      },
    });

    return res.status(201).json(newEdital);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar edital', details: error.message });
  }
};

// 2. LISTAR TODOS os Editais (Read - Todos)
export const getAllEditais = async (req, res) => {
  try {
    const editais = await prisma.edital.findMany();
    return res.status(200).json(editais);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar editais' });
  }
};

// 3. BUSCAR UM Edital por ID (Read - Único)
export const getEditalById = async (req, res) => {
  try {
    const { id } = req.params;
    const edital = await prisma.edital.findUnique({ where: { id } });

    if (!edital) {
      return res.status(404).json({ error: 'Edital não encontrado' });
    }

    return res.status(200).json(edital);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar o edital' });
  }
};

// 4. ATUALIZAR um Edital (Update)
export const updateEdital = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, banca, description, examDate } = req.body;

    const updatedEdital = await prisma.edital.update({
      where: { id },
      data: {
        title,
        banca,
        description,
        examDate: examDate ? new Date(examDate) : undefined,
      },
    });

    return res.status(200).json(updatedEdital);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar edital' });
  }
};

// 5. DELETAR um Edital (Delete)
export const deleteEdital = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.edital.delete({ where: { id } });
    return res.status(200).json({ message: 'Edital removido com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar edital' });
  }
};