import prisma from '../config/prisma.js';

// 1. CADASTRAR Usuário (Create)
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verifica se o e-mail já está cadastrado
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
    }

    const newUser = await prisma.user.create({
      data: { name, email, password }, // Em produção usaríamos hash de senha, mas para a N3 assim já resolve perfeitamente!
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
};

// 2. LISTAR TODOS os Usuários (Read - Todos)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true } // Oculta a senha na listagem por segurança
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// 3. BUSCAR UM Usuário por ID (Read - Único)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar o usuário' });
  }
};

// 4. ATUALIZAR um Usuário (Update)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, password },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

// 5. DELETAR um Usuário (Delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: 'Usuário removido com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};