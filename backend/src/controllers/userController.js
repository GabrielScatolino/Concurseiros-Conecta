import prisma from '../config/prisma.js';

const parseId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('ID inválido');
    error.statusCode = 400;
    throw error;
  }

  return id;
};

const toUsuarioData = ({ name, email, password }) => ({
  nome: name,
  email,
  senha: password,
});

// 1. CADASTRAR Usuário (Create)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, cpf } = req.body;
    const prismaData = { ...toUsuarioData({ name, email, password }), cpf };

    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF é obrigatório e deve ter 11 dígitos.' });
    }

    const userExists = await prisma.usuario.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
    }

    const cpfExists = await prisma.usuario.findUnique({ where: { cpf } });
    if (cpfExists) {
      return res.status(400).json({ error: 'CPF já cadastrado no sistema.' });
    }

    const newUser = await prisma.usuario.create({
      data: prismaData,
      select: { id_usuario: true, nome: true, email: true, data_cadastro: true },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
};

// 2. LISTAR TODOS os Usuários (Read - Todos)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: { id_usuario: true, nome: true, email: true, data_cadastro: true },
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// 3. BUSCAR UM Usuário por ID (Read - Único)
export const getUserById = async (req, res) => {
  try {
    const id_usuario = parseId(req.params.id_usuario || req.params.id);
    const user = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { id_usuario: true, nome: true, email: true, data_cadastro: true },
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
    const id_usuario = parseId(req.params.id_usuario || req.params.id);
    const { name, email, password } = req.body;

    const updateData = {
      nome: name,
      email,
    };
    if (password !== undefined && password !== '') {
      updateData.senha = password;
    }

    const updatedUser = await prisma.usuario.update({
      where: { id_usuario },
      data: updateData,
      select: { id_usuario: true, nome: true, email: true, data_cadastro: true },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
  }
};

// 5. DELETAR um Usuário (Delete)
export const deleteUser = async (req, res) => {
  try {
    const id_usuario = parseId(req.params.id_usuario || req.params.id);
    await prisma.usuario.delete({ where: { id_usuario } });
    return res.status(200).json({ message: 'Usuário removido com sucesso!' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};
