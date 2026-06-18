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

export const createUser = async (req, res) => {
  try {
    const { nome, email, senha, cpf, cidade, estado, perfil_publico } = req.body;

    if (cpf === undefined || cpf === null || String(cpf).length !== 11) {
      return res.status(400).json({ error: 'CPF é obrigatório e deve ter 11 dígitos.' });
    }

    const dados = {};
    if (nome !== undefined) dados.nome = nome;
    if (email !== undefined) dados.email = email;
    if (senha !== undefined) dados.senha = senha;
    if (cidade !== undefined) dados.cidade = cidade;
    if (estado !== undefined) dados.estado = estado;
    if (perfil_publico !== undefined) dados.perfil_publico = perfil_publico;
    dados.cpf = cpf;

    const newUser = await prisma.usuario.create({
      data: dados,
      select: { id_usuario: true, nome: true, email: true, data_cadastro: true, cidade: true, estado: true, perfil_publico: true },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'P2002') {
      const camposDuplicados = error.meta?.target || [];
      if (camposDuplicados.includes('email')) {
        return res.status(409).json({ error: 'E-mail já cadastrado no sistema.' });
      }
      if (camposDuplicados.includes('cpf')) {
        return res.status(409).json({ error: 'CPF já cadastrado no sistema.' });
      }
    }
    return res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: { id_usuario: true, nome: true, email: true, data_cadastro: true, cidade: true, estado: true, perfil_publico: true },
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id_usuario = parseId(req.params.id_usuario || req.params.id);
    const user = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { id_usuario: true, nome: true, email: true, data_cadastro: true, cpf: true, cidade: true, estado: true, perfil_publico: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar o usuário' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id_usuario = parseId(req.params.id_usuario || req.params.id);
    const { nome, email, senha, cidade, estado, perfil_publico } = req.body;

    const dadosUpdate = {};
    if (nome !== undefined) dadosUpdate.nome = nome;
    if (email !== undefined) dadosUpdate.email = email;
    if (cidade !== undefined) dadosUpdate.cidade = cidade;
    if (estado !== undefined) dadosUpdate.estado = estado;
    if (perfil_publico !== undefined) dadosUpdate.perfil_publico = perfil_publico;

    if (senha !== undefined && senha !== '') {
      dadosUpdate.senha = senha;
    }

    const updatedUser = await prisma.usuario.update({
      where: { id_usuario },
      data: dadosUpdate,
      select: { id_usuario: true, nome: true, email: true, data_cadastro: true, cidade: true, estado: true, perfil_publico: true },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'E-mail já cadastrado no sistema.' });
    }
    return res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
  }
};

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
